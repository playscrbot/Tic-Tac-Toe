from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # Enable CORS
socketio = SocketIO(app, cors_allowed_origins="*")

games = {}  # Store game states

player_symbol = 'X'
opponent_symbol = 'O'

@socketio.on('connect')
def handle_connect():
    print(f'A user connected with id: {request.sid}')

@socketio.on('createGame')
def create_game(board_size):
    game_id = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=7))
    games[game_id] = {
        'board': [None] * (board_size * board_size),
        'currentPlayer': player_symbol,
        'players': [{'id': request.sid}],  # Store the player's id
        'boardSize': board_size
    }
    
    join_room(game_id)
    emit('gameCreated', game_id, room=game_id)

@socketio.on('joinGame')
def join_game(game_id):
    game = games.get(game_id)
    if game and len(game['players']) < 2:
        game['players'].append({'id': request.sid})
        game['isPlayerOne'] = False
        game['currentPlayer'] = opponent_symbol
        
        join_room(game_id)
        emit('gameJoined', game, room=game_id)
    else:
        emit('joinError', 'Game not found or full')

@socketio.on('move')
def make_move(data):
    game_id = data['gameId']
    index = data['index']
    game = games.get(game_id)
    
    if game and game['board'][index] is None:
        if game['currentPlayer'] == player_symbol:
            game['board'][index] = game['currentPlayer']
            game['currentPlayer'] = opponent_symbol
        elif game['currentPlayer'] == opponent_symbol and not game.get('isPlayerOne'):
            game['board'][index] = game['currentPlayer']
            game['currentPlayer'] = player_symbol
        
        socketio.emit('updateGame', game, room=game_id)

@socketio.on('resetGame')
def reset_game(game_id):
    game = games.get(game_id)
    if game:
        game['board'] = [None] * (game['boardSize'] * game['boardSize'])
        game['currentPlayer'] = player_symbol
        socketio.emit('updateGame', game, room=game_id)

@socketio.on('disconnect')
def handle_disconnect():
    print(f'User  disconnected: {request.sid}')
    
    # Create a list to hold game IDs to delete
    games_to_delete = []
    
    for game_id, game in games.items():
        if any(player['id'] == request.sid for player in game['players']):
            games_to_delete.append(game_id)  # Add the game_id to the list for deletion

    # Now delete the games outside the iteration
    for game_id in games_to_delete:
        del games[game_id]
        socketio.emit('playerDisconnected', room=game_id)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3001)
    print("Server is running on port 3001")