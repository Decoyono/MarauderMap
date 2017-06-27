import React, { Component } from 'react';
import localStore from 'store'

export default class NewCampus extends Component {
    constructor(props) {
        super(props)
        this.state = {
        name: '',
        imageURL: '',
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

    }

    handleChange(event) {
        this.setState({[event.target.id]: event.target.value})
    }

    handleSubmit(event){
        event.preventDefault();
        localStore.set('name', this.state.name);
        this.setState({[name]: ''});
    }


    render() {
        return (<form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="MyNAme">My Name</label>
                    <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="write your name"
                    onChange={this.handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-success">Submit</button>
                </form>)
    }
    }