import fetch from 'isomorphic-fetch';
import {createAction} from 'redux-actions';
import request from 'superagent';

import WSConnection from './ws';


const startConnecting = createAction('START_CONNECTING');
const wsConnected = createAction('CONNECTED');

const userReceived = createAction('USER_DETAILS_RECEIVED');

const nameChange = createAction('NAME_CHANGE');
const nameChangeSuccess = createAction('NAME_CHANGE_SUCCESS');
const nameChangeFailed = createAction('NAME_CHANGE_FAILED');

const chatLinesReceived = createAction('CHAT_LINES_RECEIVED');


const _getWSLink = () => {
    return [
        (location.protocol === 'https:') ? 'wss://' : 'ws://',
        location.host,
        location.pathname.replace(/\/$/, ''),
        '/ws'
    ].join('');
}

export const connectWS = () => (dispatch, getState) => {
    let {connected} = getState();

    dispatch(startConnecting());
    let ws = new WSConnection(_getWSLink(), {
        onmessage: data => dispatch(messageReceived(data)),
        onclose: () => dispatch(wsDisconnected())
    });

    return ws.connect().then(ws => dispatch(wsConnected(ws)));

}


export const wsDisconnected = () => (dispatch, getState) => {

}


export const messageReceived = data => (dispatch, getState) => {
    console.info('Received from server', data);

    switch(data.action){
        case "setNameSuccess":
            dispatch(nameChangeSuccess());
            break;

        case "setNameFailed":
            dispatch(nameChangeFailed());
            break;

        case "userDetails":
            dispatch(userReceived(data.payload));
            break;

        case "chatLines":
            dispatch(chatLinesReceived(data.payload));
            break;
    }

}


export const setName = newName => (dispatch, getState) => {
    dispatch(nameChange(newName));

    let wsConnection = getState().chat.wsConnection;

    wsConnection.send({
        action: 'setName',
        payload: {
            name: newName
        }
    })
}

export const sendLine = line => (dispatch, getState) => {
    console.info('sendLine', line)

    let wsConnection = getState().chat.wsConnection;

    wsConnection.send({
        action: 'say',
        payload: {
            line: line
        }
    })
}