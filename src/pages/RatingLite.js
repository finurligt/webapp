import React, { Component } from 'react'
import './RatingLite.css'
import firebase from "firebase/app";
import 'firebase/database';
import { Link, Route, Switch, useParams } from 'react-router-dom'


firebase.initializeApp({
    apiKey: "AIzaSyB2p-Nt_ALgVRPN6OMnpQMScns7KubTvzQ",
    authDomain: "finurligt-cfc45.firebaseapp.com",
    databaseURL: "https://finurligt-cfc45-default-rtdb.firebaseio.com",
    projectId: "finurligt-cfc45",
    storageBucket: "finurligt-cfc45.appspot.com",
    messagingSenderId: "831486484058",
    appId: "1:831486484058:web:29fc9f6f632e12845b8263",
    measurementId: "G-DY95FM51QH"
})
const db = firebase.database();


//const database = firebase.database().ref().child("ratingLite")


export class RatingLite extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showAddLeagueElement: false,
            leagues: []
        }

        this.updateLeague = this.updateLeague.bind(this);
    }

    updateLeague(e) {
        this.setState({
            league: e.target.value
        })
    }

    componentDidMount() {
        var dbRef = db.ref('ratingLite/leagues');
        dbRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log("setting league data: ")
            console.log(data)


            this.setState({
                leagues: data
            })
        });
    }

    render() {
        return (
            <>
                <div className="row" style={{
                    margin: 0
                }}>
                    <div className="col-sm-3" style={{}}></div>

                    <div className="col-sm-6" style={{ textAlign: "left", backgroundColor: "white" }}>
                        {/* Select League */}
                        <div className="btn-group">
                            <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Select League
                            </button>
                            <div className="dropdown-menu">
                                {Object.values(this.state.leagues).map(league => (
                                    <Link key={league.id} className="dropdown-item" to={"/ratingLite/" + league.id} >{league.name}</Link>
                                    //TODO: This does not work util I fix dynamic routing
                                ))}
                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#">Add new league</a>
                            </div>
                        </div>
                        <div className="input-group mt-3">
                            <input type="text" class="form-control" placeholder="League Name" aria-label="League Name" aria-describedby="basic-addon2" />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" type="button">Add</button>
                            </div>
                        </div>
                        <Switch>
                            <Route path={this.props.match.path + "/:leagueId"} component={League}></Route>
                        </Switch>
                    </div>
                    <div className="col-sm-3"></div>
                </div>
            </>
        )
    }
}

class League extends Component {

    constructor(props) {
        super(props);
        //find out where to find LeagueId
        this.state = {
            league: this.props.match.params.leagueId,
            winner: undefined,
            loser: undefined,
            games: undefined,
        }

        this.submitGame = this.submitGame.bind(this);
        this.updateWinner = this.updateWinner.bind(this);
        this.updateLoser = this.updateLoser.bind(this);
    }

    submitGame(e) {
        e.preventDefault();

        firebase.database().ref('ratingLite/games/' + this.state.league).push({
            winner: this.state.winner,
            loser: this.state.loser,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            valid: true
        });
    }

    updateWinner(e) {
        this.setState({
            winner: e.target.value
        })
    }

    updateLoser(e) {
        this.setState({
            loser: e.target.value
        })
    }

    componentDidMount() {
        var dbRef = db.ref('ratingLite/games/' + this.state.league);
        dbRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log("game data:")
            console.log(data)


            this.setState({
                games: data,
            })
        });
    }

    render() {
        console.log("state:")
        console.log(this.state)
        let games = this.state.games ? Object.values(this.state.games) : [];

        let map = {}
        games.forEach((game) => {
            let winnerElo = map[game.winner] ? map[game.winner] : 1200;
            let loserElo = map[game.loser] ? map[game.loser] : 1200;

            var expectedA = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));

            var kValue = 40;
            var ratingChange = Math.round(kValue * (1 - expectedA));

            map[game.winner] = winnerElo + ratingChange;
            map[game.loser] = loserElo - ratingChange;
        })
        let players = Object.entries(map).sort((a, b) => b[1] - a[1]);
        console.log(games)
        console.log(players)



        return (
            <>
                <h2 style={{ textAlign: "center" }}>League: {this.state.league}</h2>
                <form className="gameForm" onSubmit={this.submitGame}>
                    <div className="form-group">
                        <label htmlFor="inputWinner">Winner</label>
                        <input required type="text" className="form-control" id="inputWinner" placeholder="Winner"
                            value={this.state.winner} onChange={this.updateWinner} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputLoser">Loser</label>
                        <input required type="text" className="form-control" id="inputLoser" placeholder="Loser"
                            value={this.state.loser} onChange={this.updateLoser} />
                    </div>

                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>

                <div className="gameList" style={{ textAlign: "center" }}>
                    <h2 >Players</h2>
                    {players.map(player => (
                        <div key={player[0]}>
                            <div>
                                <div className="row">

                                    <div className="col-6" style={{ textAlign: "left" }} >{player[0]}</div>
                                    <div className="col-6" style={{ textAlign: "right" }} >{player[1]}</div>


                                </div>
                                <hr />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="gameList" style={{ textAlign: "center" }}>
                    <h2 >Game History</h2>
                    {games.map(game => (
                        <div key={game.timestamp}>
                            <div>
                                <div className="row">

                                    <div className="col-6" style={{ textAlign: "left" }} >{game.winner}</div>
                                    <div className="col-6" style={{ textAlign: "right" }} >{game.loser}</div>


                                </div>
                                <hr />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }
}

export default RatingLite
