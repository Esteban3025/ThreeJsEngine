import FiniteStateMachine from './FiniteStateMachine.mjs';
import DanceState from './states/DanceState.mjs';
import WalkState from './states/WalkState.mjs';
import RunState from './states/RunState.mjs';
import IdleState from './states/IdleState.mjs';

class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState('idle', IdleState);
    this._AddState('walk', WalkState);
    this._AddState('run', RunState);
    this._AddState('dance', DanceState);
  }
};

export default CharacterFSM;
