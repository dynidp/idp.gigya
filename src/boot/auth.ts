import { interpret, AnyStateMachine, State,InterpreterFrom } from 'xstate'

import {AuthMachine, authMachine, AuthMachineContext, AuthMachineEvents} from '../machines/authMachine'

function load<Machine extends  AnyStateMachine=AnyStateMachine>(machine: Machine, id:(machine: Machine)=> string = (machine)=> `machines/${machine.id}`) {
    const key=id(machine);
    try {
        const stored= localStorage.getItem(key);
        if(stored)
            {
                return  State.create(JSON.parse(stored));
            }
        else return State.create(machine.initialState);


    }
    catch(e) {
        console.error('Failed to load machine state', e, key, machine);
        return State.create(machine.initialState); 
    }


}

function save<Machine extends  AnyStateMachine=AnyStateMachine, Service extends InterpreterFrom<Machine>=InterpreterFrom<Machine>>(service: Service, id:(machine: Machine)=> string = (machine)=> `machines/${machine.id}`) {
    const key=id(service.machine as Machine);
  
    service.onTransition(state => {
        console.log('onTransition-bottom', state.value)
        try {
            localStorage.setItem(key, JSON.stringify(state.value))
        } catch (e) {

        }
    })


}

export const authService= (machine: AuthMachine) =>{
    const previousState = load(machine); 
    interpret(authMachine, { devTools: true })
    .onTransition(state => {
        console.log('onTransition-bottom', state.value)
        try {
            localStorage.setItem(`auth/${authMachine.id}`, JSON.stringify(state.value))
        } catch (e) {

        }
    }).start(previousState)

}
 

