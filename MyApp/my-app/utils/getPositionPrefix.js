const getPositionPrefix = (position) => {
  switch (position) {
    case 'Left Back':
      return 'LB';
    case 'Right Back':
      return 'RB';
    case 'Pivot':
      return 'PV';
    case 'Centre Back':
      return 'CB';
    case 'Left Wing':
      return 'LW';
    case 'Right Wing':
      return 'RW';
    case 'Goalkeeper':
      return 'GK';
    default:
      console.log('Invalid position: ', position);
      throw new Error('Invalid position');
  }
};

export const getPlayerCategory = (position) => {
  switch (position.toLowerCase()) {
    case 'left back':
    case 'leftback':
    case 'right back':
    case 'rightback':
      return 'backs';
    case 'centre back':
    case 'centreback':
    case 'pivot':
      return 'middles';
    case 'goalkeeper':
      return 'goalkeeper';
    case 'left wing':
    case 'leftwing':
    case 'right wing':
    case 'rightwing':
      return 'wings';
    default:
      throw new Error('Invalid position');
  }
}


export default getPositionPrefix;