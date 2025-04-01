import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, SectionList } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamData } from '../redux/slices/teamSlice';
import { fetchUsersCompetitions, setRoundAlias, setSelectedCompetition } from '../redux/slices/usersCompetitionSlice';
import { fetchPlayerSelectionData } from '../redux/slices/playerSelectionSlice';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import getPositionPrefix from '../utils/getPositionPrefix';
import fetchClient from '../utils/apiCaller';
//import { useAuth } from '../utils/useAuthentication';



const PlayerSelect = ({ navigation }, props) => {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [comps, setComps] = useState([]);
  const [draftTeam, setDraftTeam] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState(null);
  const [savingsSuccess, setSavingsSuccess] = useState(false);
  const [concatenatedError, setConcatenatedError] = useState('');

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


  const roundAlias = useSelector((state) => state.usersCompetitions.roundAlias);
  const [dropDownValue, setDropDownValue] = useState(null);

  const teamNames = [...new Set(playersData.map(player => player.teamname))];
  const [visibleTeams, setVisibleTeams] = useState({});

  const playersByTeam = teamNames.map(team => ({
    teamname: team,
    players: playersData.filter(player => player.teamname === team)
  }));

  //-------- USE EFFECTS --------

  useEffect(() => {
    const fetchData = async () => {
      if (!UCLoading && !UCError && usersCompetitionData.length === 0) {
        console.log('Fetching usersCompetitionData ');
        await dispatch(fetchUsersCompetitions());
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

      if(response.status !== 200){
        setSavingError(response.data.message);
        return;
      }

      setSavingsSuccess(true);
      setSavingError(null);
    } catch (error) {
      setSavingError(error.message);
    } finally {
      setIsSaving(false);
    }
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

    return (
      <View key={item} style={styles.teamsContainer}>
        <TouchableOpacity style={styles.teamButton} onPress={() => toggleVisibility(item)}>
          <Text style={styles.text}>{item}</Text>
          <Text style={styles.text}>{visibleTeams[item] ? '-' : '+'}</Text>
        </TouchableOpacity>
        {visibleTeams[item] && (
          <FlatList
            style={styles.teamsList}
            data={teamPlayers}
            keyExtractor={player => player.playerid.toString()}
            renderItem={renderPlayer}
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
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.playerText, styles.unSelectedPlayerText]}>{item.playername}</Text>
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
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.playerText, styles.selectedPlayerText]}>{item.playername}</Text>
        <View style={styles.playerStaticInfo}>
          <Text style={[styles.playerText, styles.selectedPlayerText]}>{getPositionPrefix(item.positionname)}</Text>
          <Text style={[styles.playerText, styles.selectedPlayerText, styles.marginHoriz]}>{item.price}</Text>
          <Icon style={styles.icon} name="trash" size={25} color="#ef0000" onPress={() => removePlayerFromDraftTeam(item)} />
        </View>
      </View >
    );
  }


  const addPlayerToDraftTeam = (player) => {
    setConcatenatedError('');
    setDraftTeam([...draftTeam, player]);
  }

  const removePlayerFromDraftTeam = (player) => {
    setConcatenatedError('');
    setDraftTeam(draftTeam.filter(item => item.playerid !== player.playerid));
  }



  const renderTeams = () => {
    //OLD - cannot use a flatList within a scrollview
    console.log('Rendering teamssss');
    return teamNames.map(team => {
      console.log('Rendering team: ', team);
      const teamPlayers = playersByTeam.filter(localTeam => localTeam.teamname === team)[0].players;
      console.log('has players: ', teamPlayers);
      return (
        <View key={team} style={styles.teamsContainer}>
          <TouchableOpacity style={styles.teamButton} onPress={() => toggleVisibility(team)}>
            <Text style={styles.text}>{team}</Text>
            <Text style={styles.text}>{visibleTeams[team] ? '-' : '+'}</Text>
          </TouchableOpacity>
          {visibleTeams[team] && (
            <FlatList
              data={teamPlayers}
              keyExtractor={player => player.playerid.toString()}
              renderItem={({ item }) => <Text style={styles.text}>{item.playername}</Text>}
            />
          )}
        </View>
      );
    });
  }


  if (teamLoading || UCLoading || playersLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>Player Selection</Text>
        {roundAlias && <Text style={styles.subtitle}>For {roundAlias}</Text>}
        <View style={styles.teaminfo}>
          <Text style={styles.text}>Total Price: {draftTeam.reduce((acc, player) => acc + player.price, 0)}</Text>
          <Text style={styles.text}>Average:</Text>
        </View>

        {isSaving && <Text style={styles.loading}>Saving...</Text>}

        {savingsSuccess && <Text style={[styles.text, styles.saved]}>Team Saved!</Text>}

        {(concatenatedError) && <Text style={concatenatedError.length < 100 ? styles.error : styles.smallError}>{concatenatedError}</Text>}

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
        />
      }

      {/* {teamNames.length > 0 && renderTeams()} //working */}


      {/* {playersData.length > 0 && <Text style={styles.label}>Players {playersData[0].playername}</Text>}
      {teamNames.length > 0 && <Text style={styles.label}>Teams {teamNames[0]}</Text>} */}


      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={SaveTeam} disabled={isSaving}>
          <Text style={styles.text}>Save Team!</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={GoBack} disabled={isSaving}>
          <Text style={styles.text}>Go Back</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
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
  },
  unSelectedPlayerText: {
    color: 'white',
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
  bottomButtons: {
    marginTop: 20,
    alignItems: 'center',
  },
  teamButton: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomButton: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 20,
  },
});

export default PlayerSelect;
