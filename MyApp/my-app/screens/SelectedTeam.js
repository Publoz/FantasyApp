import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamData } from '../redux/slices/teamSlice';
import { fetchUsersCompetitions, setRoundAlias, setSelectedCompetition } from '../redux/slices/usersCompetitionSlice';
//import { useAuth } from '../utils/useAuthentication';



const SelectedTeam = ({ navigation }, props) => {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [comps, setComps] = useState([]);

  const usersCompetitionData = useSelector((state) => state.usersCompetitions.competitionData); //UC
  const UCLoading = useSelector((state) => state.usersCompetitions.loading);
  const UCError = useSelector((state) => state.usersCompetitions.error);
  const selectedCompetition = useSelector((state) => state.usersCompetitions.selectedCompetition);

  const teamData = useSelector((state) => state.team.teamData);
  const teamLoading = useSelector((state) => state.team.loading);
  const teamError = useSelector((state) => state.team.error);

  const roundAlias = useSelector((state) => state.usersCompetitions.roundAlias);
  const [dropDownValue, setDropDownValue] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!UCLoading && !UCError && usersCompetitionData.length === 0) {
        console.log('Fetching usersCompetitionData ');
        await dispatch(fetchUsersCompetitions());
      }
    };

    if(selectedCompetition){
      setDropDownValue(selectedCompetition);
    }

    fetchData();
  }, []);

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
        dispatch(setRoundAlias(competition.roundalias));
        dispatch(setSelectedCompetition(dropDownValue));
      }
    }
  }, [dropDownValue]);


  const GoBack = () => {
    navigation.navigate('Home');
  };

  const getPriceColor = (price) => {
    if (price >= 30) {
      return 'red';
    } else if (price > 15) {
      return 'orange';
    } else {
      return 'green';
    }
  };

  const filterByPosition = (positions) => {
    return teamData.filter(player => positions.includes(player.positionname));
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.text}>{item.playername}</Text>
      <Text style={styles.text}>
        Price: <Text style={{ color: getPriceColor(item.price) }}>{item.price}</Text>
      </Text>
      <Text style={styles.text}>Position: {item.positionname}</Text>
    </View>
    //TODO: Add more player details e.g Position, team
  );

  if (UCLoading || teamLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>Your Selected Team this week</Text>
      {roundAlias && <Text style={styles.subtitle}>For {roundAlias}</Text>}

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
          containerStyle={{width: '80%', height: '80%'}}
          theme="DARK"
          multiple={false}
          mode="SIMPLE"
          placeholder='Select a competition'
        />
      </View>

      <View style={styles.teaminfo}>
        <Text style={styles.text}>Total Price: {teamData.reduce((acc, player) => acc + player.price, 0)}</Text>
      </View>


      {teamError && <Text style={styles.error}>{teamError}</Text>}
      <ScrollView>
        <Text style={styles.label}>Backs</Text>
        <View style={styles.list}>
          <FlatList
            data={filterByPosition(['Left Back', 'Right Back'])}
            renderItem={renderItem}
            keyExtractor={(item) => item.playerid.toString()}
            scrollEnabled={false}
          />
        </View>

        <Text style={styles.label}>Middles</Text>
        <View style={styles.list}>
          <FlatList
            data={filterByPosition(['Pivot', 'Centre Back'])}
            renderItem={renderItem}
            keyExtractor={(item) => item.playerid.toString()}
            scrollEnabled={false}
          />
        </View>

        <Text style={styles.label}>Wings</Text>
        <View style={styles.list}>
          <FlatList
            data={filterByPosition(['Left Wing', 'Right Wing'])}
            renderItem={renderItem}
            keyExtractor={(item) => item.playerid.toString()}
            scrollEnabled={false}
          />
        </View>

        <Text style={styles.label}>Goalkeepers</Text>
        <View style={styles.list}>
          <FlatList
            data={filterByPosition('Goalkeeper')}
            renderItem={renderItem}
            keyExtractor={(item) => item.playerid.toString()}
            scrollEnabled={false}
          />
        </View>

      </ScrollView>
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={GoBack}>
          <Text style={styles.text}>Go Back</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e78ff',
    justifyContent: 'center',
  },
  dropDownContainer: {
    flex: 1,
    backgroundColor: '#1e78ff',
    alignItems: 'center',
    marginBottom: 40,
    padding: 5
  },
  list: {
    flexGrow: 1,
  },
  teaminfo: {
    marginTop: 20,
    marginLeft: 10
  },

  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'left',
  },
  loading: {
    color: 'white',
    fontSize: 35,
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    color: '#fe8c19',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 20,
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
  bottomButton: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 20,
  },
});

export default SelectedTeam;
