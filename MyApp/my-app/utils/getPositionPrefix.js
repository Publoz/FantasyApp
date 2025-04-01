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

export default getPositionPrefix;