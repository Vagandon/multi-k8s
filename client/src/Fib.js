import React, { Component } from 'react';
import axios from 'axios'; // this module is used to make requests to express backend server

class Fib extends Component {
    // some initial state definition:
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    // Getting data:
    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }

    // Handle a submit event, i.e. when the user presses the submit button:
    handleSubmit = async (event) => {
        event.preventDefault(); // this prevents that the form submits itself

        await axios.post('/api/values', {
            index: this.state.index
        });
        this.setState({ index: ''});
    };

    // Render Helper Functions
    renderSeenIndexes(){
        //seenIndexes is an array => that's the default when data is pulled out
        //of PostGres. The map function moves through the array and maps
        //each value to number; then they are joined
        return this.state.seenIndexes.map(({number}) => number).join(', ');
    }

    renderValues() {
        //the values are pulled out of redis => we get an object from redis
        const entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    for index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    // Rendering:
    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input 
                        values={this.state.index}
                        onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;

