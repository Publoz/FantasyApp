import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamData, setTeamData } from '../redux/slices/teamSlice';
import { fetchUsersCompetitions, setRoundAlias, setSelectedCompetition } from '../redux/slices/usersCompetitionSlice';
import { fetchPlayerSelectionData } from '../redux/slices/playerSelectionSlice';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import getPositionPrefix from '../utils/getPositionPrefix';
import { getPlayerCategory } from '../utils/getPositionPrefix';
import fetchClient from '../utils/apiCaller';
import { fetchSelectionRules } from '../redux/slices/rulesSelectionSlice';
//import { useAuth } from '../utils/useAuthentication';

const { width: screenWidth } = Dimensions.get('window');


const PlayerSelect = ({ navigation }, props) => {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [comps, setComps] = useState([]);
  const [draftTeam, setDraftTeam] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState(null);
  const [savingsSuccess, setSavingsSuccess] = useState(false);
  const [concatenatedError, setConcatenatedError] = useState('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  //Player Popup
  const [playerPopupVisible, setPlayerPopupVisible] = useState(false);
  const [playerPopupPosition, setPlayerPopupPosition] = useState({ top: 0, left: 0 });
  const [playerPopupPlayer, setPlayerPopupPlayer] = useState(null);

  const usersCompetitionData = useSelector((state) => state.usersCompetitions.competitionData); //UC
  const UCLoading = useSelector((state) => state.usersCompetitions.loading);
  const UCError = useSelector((state) => state.usersCompetitions.error);
  const selectedCompetition = useSelector((state) => state.usersCompetitions.selectedCompetition); //contains roundId

  const teamData = useSelector((state) => state.team.teamData);
  const teamLoading = useSelector((state) => state.team.loading);
  const teamError = useSelector((state) => state.team.error);

  const playersData = useSelector((state) => state.playerSelection.playersData);
  const playersLoading = useSelector((state) => state.playerSelection.loading);
  const playersError = useSelector((state) => state.playerSelection.error);

  const selectionRulesData = useSelector((state) => state.selectionRules.rulesData);
  const selectionRulesRoundId = useSelector((state) => state.selectionRules.roundId);
  const selectionRulesLoading = useSelector((state) => state.selectionRules.loading);


  const roundAlias = useSelector((state) => state.usersCompetitions.roundAlias);
  const [dropDownValue, setDropDownValue] = useState(null);

  const teamNames = [...new Set(playersData?.map(player => player.teamname))];
  const [visibleTeams, setVisibleTeams] = useState({});

  const positions = [
    'wings',
    'middles',
    'backs',
    'leftwing',
    'leftback',
    'centreback',
    'rightback',
    'rightwing',
    'pivot',
    'goalkeeper'
  ];

  const positionNames = {
    wings: 'Wings',
    middles: 'Middles',
    backs: 'Backs',
    leftwing: 'Left Wings',
    leftback: 'Left Backs',
    centreback: 'Centre Backs',
    rightback: 'Right Backs',
    rightwing: 'Right Wings',
    pivot: 'Pivots',
    goalkeeper: 'Goalkeepers'
  };

  const playersByTeam = teamNames.map(team => ({
    teamname: team,
    players: playersData.filter(player => player.teamname === team)
  }));

  //-------- USE EFFECTS --------

  //Initial Load
  useEffect(() => {
    const fetchData = async () => {
      if (!UCLoading && !UCError && usersCompetitionData.length === 0) {
        console.log('Fetching usersCompetitionData ');
        await dispatch(fetchUsersCompetitions());
      } else if (selectedCompetition && teamData.length > 0) {
        //Handles case where we have gone to team for this week screen first and hence selectedCompetition
        //All we need now is the players
        const competition = usersCompetitionData.find(
          (comp) => comp.currentroundid.toString() === selectedCompetition
        );

        await dispatch(fetchPlayerSelectionData(competition.competitionid));
      }
    };

    if (selectedCompetition) {
      setDropDownValue(selectedCompetition);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const errors = [savingError, UCError, teamError, playersError].filter(Boolean).join(' | ');
    setConcatenatedError(errors);
  }, [savingError, UCError, teamError, playersError]);

  useEffect(() => {
    if (usersCompetitionData.length > 0) {
      const transformedData = usersCompetitionData.map((competition) => ({
        label: competition.competitionname,
        value: competition.currentroundid.toString(),
      }));
      setComps(transformedData);
    }
  }, [usersCompetitionData]);

  useEffect(() => {
    if (dropDownValue && dropDownValue !== selectedCompetition) {
      console.log('Dispatching fetchTeamData for roundId: ' + dropDownValue);
      dispatch(fetchTeamData(dropDownValue));
      const competition = usersCompetitionData.find(
        (comp) => comp.currentroundid.toString() === dropDownValue
      );

      console.log('Competition: ', competition);
      if (competition) {
        dispatch(fetchPlayerSelectionData(competition.competitionid));
        dispatch(setRoundAlias(competition.roundalias));
        dispatch(setSelectedCompetition(dropDownValue));
      }
    }
  }, [dropDownValue]);

  useEffect(() => {
    if (teamData.length > 0) {
      setDraftTeam(teamData);
    }
  }, [teamData]);

  // ----------------------

  const SaveTeam = async () => {
    setIsSaving(true);
    setConcatenatedError('');
    try {
      const response = await fetchClient.post(`/teamSelection/team`, {
        roundid: selectedCompetition,
        selectedTeam: draftTeam.map(player => player.playerid),
      }, {
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        },
      });

      if (response.status !== 200) {
        setSavingError(response.data.message);
        return;
      }

      dispatch(setTeamData(draftTeam));
      setSavingsSuccess(true);
      setSavingError(null);
    } catch (error) {
      setSavingError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const ViewRules = async () => {
    setIsRulesOpen(!isRulesOpen);
    await dispatch(fetchSelectionRules(dropDownValue));

  };

  const GoBack = () => {
    console.log(playersData);
    navigation.navigate('Home');
  };

  const toggleVisibility = (teamname) => {
    setVisibleTeams(prevState => ({
      ...prevState,
      [teamname]: !prevState[teamname]
    }));
  };

  const renderTeam = ({ item }) => {
    const teamPlayers = playersByTeam.filter(localTeam => localTeam.teamname === item)[0].players;
    const hexcolour = teamPlayers[0].hexcolour;

    return (
      <View key={item} style={styles.teamsContainer}>
        <TouchableOpacity style={[styles.teamButton, { borderColor: hexcolour ? '#' + hexcolour : 'white' }]} onPress={() => toggleVisibility(item)}>
          <Text style={styles.text}>{item}</Text>
          <Text style={styles.text}>{visibleTeams[item] ? '-' : '+'}</Text>
        </TouchableOpacity>
        {visibleTeams[item] && (
          <FlatList
            style={styles.teamsList}
            data={teamPlayers}
            keyExtractor={player => player.playerid.toString()}
            renderItem={renderPlayer}
            onScroll={() => setPlayerPopupVisible(false)}
          />
        )}
      </View>
    );
  }

  const renderPlayer = ({ item }) => {
    const isPlayerInTeam = draftTeam.some(player => player.playerid === item.playerid);

    if (isPlayerInTeam) {
      return renderSelectedPlayer(item);
    }

    //Unselected
    return (
      <View style={styles.playerContainer}>
        <TouchableOpacity onPress={(event) => togglePlayerPopup(event, item)} style={{ flex: 1 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.playerText, styles.unSelectedPlayerText]}>{item.playername}</Text>
        </TouchableOpacity>
        <View style={styles.playerStaticInfo}>
          <Text style={[styles.playerText, styles.unSelectedPlayerText]}>{getPositionPrefix(item.positionname)}</Text>
          <Text style={[styles.playerText, styles.unSelectedPlayerText, styles.marginHoriz]}>{item.price}</Text>
          <MaterialIcon style={styles.icon} name="attach-money" size={25} color="#12e700" onPress={() => addPlayerToDraftTeam(item)} />
        </View>
      </View >
    )
  }


  const renderSelectedPlayer = (item) => {
    return (
      <View style={styles.playerContainer}>
        <TouchableOpacity onPress={(event) => togglePlayerPopup(event, item)} style={{ flex: 1 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.playerText, styles.selectedPlayerText]}>{item.playername}</Text>
        </TouchableOpacity>
        <View style={styles.playerStaticInfo}>
          <Text style={[styles.playerText, styles.selectedPlayerText]}>{getPositionPrefix(item.positionname)}</Text>
          <Text style={[styles.playerText, styles.selectedPlayerText, styles.marginHoriz]}>{item.price}</Text>
          <Icon style={styles.icon} name="trash" size={25} color="#ef0000" onPress={() => removePlayerFromDraftTeam(item)} />
        </View>
      </View >
    );
  }

  const togglePlayerPopup = (event, player) => {
    if(playerPopupVisible && playerPopupPlayer && playerPopupPlayer.playerid === player.playerid) {
      setPlayerPopupVisible(false);
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    setPlayerPopupPosition({ top: pageY - 160, left: pageX - 80 });
    setPlayerPopupPlayer(player);
    setPlayerPopupVisible(true);

  }


  const addPlayerToDraftTeam = (player) => {
    setConcatenatedError('');
    setDraftTeam([...draftTeam, player]);
  }

  const removePlayerFromDraftTeam = (player) => {
    setConcatenatedError('');
    setDraftTeam(draftTeam.filter(item => item.playerid !== player.playerid));
  }


  const renderModal = () => {

    if (selectionRulesLoading) {
      return (
        <View style={[styles.rulesModalContainer]}>
          <Text style={styles.loading}>Loading...</Text>
          <TouchableOpacity style={styles.bottomButton} onPress={() => setIsRulesOpen(false)}>
            <Text style={[styles.text, styles.bottomText]}>Close Popup</Text>
          </TouchableOpacity>
        </View>
      )
    }

    const positionCounts = {
      leftback: 0,
      rightback: 0,
      pivot: 0,
      centreback: 0,
      leftwing: 0,
      rightwing: 0,
      goalkeeper: 0,
      wings: 0,
      middles: 0,
      backs: 0,
    };

    draftTeam.forEach(player => {

      const pos = player.positionname.replace(/ /g, '').toLowerCase();
      const cat = getPlayerCategory(pos);
      if (positionCounts.hasOwnProperty(pos)) {
        positionCounts[pos]++;
      } else {
        console.log('Invalid position: ', pos);
        throw new Error('Invalid position');
      }

      if (pos !== 'goalkeeper') {
        if (positionCounts.hasOwnProperty(cat)) {
          positionCounts[cat]++;
        } else {
          console.log('Invalid Category: ', pcatos);
          throw new Error('Invalid Category');
        }
      }

    });

    return (<SafeAreaView style={[styles.rulesModalContainer]}>
      <Text style={[styles.text, styles.positionTitle]}>Team Budget: {selectionRulesData[0].teambudget}</Text>

      <ScrollView>
        {positions.map(position => renderPositionRules(position, selectionRulesData[0].minpositions[position], selectionRulesData[0].maxpositions[position], positionCounts[position]))}
      </ScrollView>

      <TouchableOpacity style={styles.bottomButton} onPress={() => setIsRulesOpen(false)}>
        <Text style={[styles.text, styles.bottomText]}>Close Popup</Text>
      </TouchableOpacity>
    </SafeAreaView>
    );

  }

  const renderPositionRules = (position, posMin, posMax, posCount) => {
    const positionName = positionNames[position] || position;
    const minText = posMin !== -1 ? `Min: ${posMin}` : 'Min: -';
    const maxText = posMax !== -1 ? `Max: ${posMax}` : 'Max: -';
    const haveText = posCount !== -1 ? `Have: ${posCount}` : 'Have: 0';

    const isInvalid = (posCount < posMin && posMin !== -1) || (posCount > posMax && posMax !== -1);

    const validStyle = isInvalid ? { color: 'red' } : {};

    const minTextStyle = [styles.text];
    const maxTextStyle = [styles.text];

    if (posCount < posMin && posMin !== -1) {
      minTextStyle.push(styles.redText);
    }

    if (posCount > posMax && posMax !== -1) {
      maxTextStyle.push(styles.redText);
    }

    return (
      <View key={position} style={styles.positionRuleContainer}>
        <Text style={[styles.text, styles.positionTitle, validStyle]}>{positionName}</Text>
        <View>
          <Text style={minTextStyle}>{minText}</Text>
          <Text style={[styles.text]}>{haveText}</Text>
          <Text style={[maxTextStyle]}>{maxText}</Text>
        </View>
      </View >
    );

  }



  const renderPrice = () => {
    const totalPrice = draftTeam.reduce((acc, player) => acc + player.price, 0);
    const overBudget = selectionRulesData?.length > 0 && totalPrice > selectionRulesData[0].teambudget;

    if (selectionRulesData?.length === 0 || selectionRulesRoundId === null || selectionRulesRoundId !== dropDownValue) {
      return (<Text style={styles.text}>Total Price: {draftTeam.reduce((acc, player) => acc + player.price, 0)}</Text>);
    }

    return (
      <Text style={styles.text}>
        Total Price: <Text style={overBudget ? { color: 'red' } : {}}>{totalPrice}</Text> / {selectionRulesData[0].teambudget}
      </Text>
    );
  }


  if (teamLoading || UCLoading || playersLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>);
  }

  return (
    <TouchableWithoutFeedback onPress={() => setPlayerPopupVisible(false)}>
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>

          <Text style={styles.title}>Player Selection</Text>
          {roundAlias && <Text style={styles.subtitle}>For {roundAlias}</Text>}
          <View style={styles.teaminfo}>
            {renderPrice()}
            <Text style={styles.text}>Average:</Text>
          </View>

          {isSaving && <Text style={styles.loading}>Saving...</Text>}

          {savingsSuccess && <Text style={[styles.text, styles.saved]}>Team Saved!</Text>}

          {(concatenatedError) && <Text style={concatenatedError.length < 100 ? styles.error : styles.smallError}>{concatenatedError}</Text>}

          {playerPopupVisible && playerPopupPlayer && (
            <View style={[styles.playerPopup, { top: playerPopupPosition.top, left: playerPopupPosition.left }]}>
              <Text style={styles.text}>Opponents for round: {playerPopupPlayer.opponents}</Text>
              <Text style={styles.text}>Average points: {playerPopupPlayer.averagepoints}</Text>
            </View>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={isRulesOpen}
            onRequestClose={() => setIsRulesOpen(false)}
          >
            {isRulesOpen && renderModal()}
          </Modal>

          <View style={styles.dropDownContainer}>
            <DropDownPicker
              open={open}
              value={dropDownValue}
              items={comps}
              setOpen={setOpen}
              setValue={setDropDownValue}
              setItems={setComps}
              labelStyle={{
                fontSize: 16,
                textAlign: 'center',
                fontWeight: 'bold'
              }}
              textStyle={{
                fontSize: 14,
                textAlign: 'center',
              }}
              containerStyle={{ width: '80%', height: '80%' }}
              theme="DARK"
              multiple={false}
              mode="SIMPLE"
              placeholder='Select a competition'
            />
          </View>
        </View>

        {teamNames.length > 0 &&
          <FlatList style={styles.teamsSection}
            data={teamNames}
            renderItem={renderTeam}
            keyExtractor={item => item}
            onScroll={() => setPlayerPopupVisible(false)}
          />
        }

        {/* {teamNames.length > 0 && renderTeams()} //working */}


        {/* {playersData.length > 0 && <Text style={styles.label}>Players {playersData[0].playername}</Text>}
      {teamNames.length > 0 && <Text style={styles.label}>Teams {teamNames[0]}</Text>} */}


        <View style={styles.bottomButtons}>
          {teamNames.length > 0 && <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <TouchableOpacity style={styles.bottomButton} onPress={SaveTeam} disabled={isSaving}>
              <Text style={[styles.text, styles.bottomText]}>Save Team!</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomButton} onPress={ViewRules} disabled={isSaving}>
              <Text style={[styles.text, styles.bottomText]}>Selection Rules</Text>
            </TouchableOpacity>
          </View>}

          <TouchableOpacity style={styles.bottomButton} onPress={GoBack} disabled={isSaving}>
            <Text style={[styles.text, styles.bottomText]}>Go Back</Text>
          </TouchableOpacity>
        </View>


      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#1e78ff',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  teamsContainer: {
    margin: 5,
    padding: 3,
    borderRadius: 5,

  },
  teamsList: {
    alignItems: 'left',
    backgroundColor: '#777777',
    marginHorizontal: 20,
    padding: 10,
    width: '90%',
  },
  teamsSection: {
    flex: 1,
    overflow: 'scroll',
  },
  teaminfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 12,
    padding: 8,
    backgroundColor: '#777777',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#333333',
  },
  header: {
    marginBottom: 80,
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'left',
  },
  saved: {
    textAlign: 'center',
    color: '#12e700'
  },
  playerText: {
    fontSize: 20,
    textAlign: 'left',
    maxWidth: '60%',
    overflow: 'hidden',
  },
  selectedPlayerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '85%',  
  },
  unSelectedPlayerText: {
    color: 'white',
    maxWidth: '85%',  
  },
  marginHoriz: {
    marginHorizontal: 10,
  },
  icon: {
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: '#333333'
  },
  loading: {
    color: 'white',
    fontSize: 35,
    textAlign: 'center',
  },
  dropDownContainer: {
    flex: 1,
    backgroundColor: '#1e78ff',
    alignItems: 'center',
    padding: 5
  },
  playerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  playerStaticInfo: {
    flexDirection: 'row',
  },
  title: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  label: {
    color: '#fe8c19',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  error: {
    color: 'rgb(200, 0, 0)',
    fontSize: 20,
    textAlign: 'center',
  },
  smallError: {
    color: 'rgb(200, 0, 0)',
    fontSize: 10, // Smaller font size
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
  rulesModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  positionRuleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
    marginVertical: 5,
    borderWidth: 2,
    borderColor: '#333333',
  },
  redText: {
    color: 'red',
  },
  positionTitle: {
    width: '60%',
    fontSize: 25,
    textAlign: 'Left',
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 10,
  },
  playerPopup: {
    position: 'absolute',
    width: '75%',
    padding: 5,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: 'white',
    backgroundColor: 'rgba(31, 32, 37, 0.9)',
    zIndex: 1000,
  },
  bottomButtons: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    textAlign: 'center',
  },
  teamButton: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 3,
    borderColor: 'white',
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomButton: {
    backgroundColor: '#fe8c19',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 10,
    width: screenWidth * 0.35
  },
});

export default PlayerSelect;
