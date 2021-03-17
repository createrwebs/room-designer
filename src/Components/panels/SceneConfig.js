import React, { Component } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import {
    setCurrentSceneProp,
    setCurrentSceneWall,
    setCurrentSceneWallLength
}
    from '../../api/actions'

// import './bars.css';

class SceneConfig extends Component {
    constructor (props) {
        super(props);
        this.state = { value: '' };

        this.setProp = this.setProp.bind(this);
        this.setWall = this.setWall.bind(this);
        this.setWallLength = this.setWallLength.bind(this);
    }
    /*
    https://react-bootstrap.github.io/components/navbar/ 
    */

    setProp(prop) {
        this.props.setCurrentSceneProp(prop)
    }
    setWall(which, checked) {
        this.props.setCurrentSceneWall(which, checked)
    }
    setWallLength(which, length) {
        this.props.setCurrentSceneWallLength(which, length)
    }
    render() {
        return (
            <Form inline>
                <Form.Row>
                    {this.props.walls.map((wall) => (
                        <div key={`inline-wall-${wall.which}`} className="mb-3">
                            <InputGroup className="mb-2 mr-sm-2">
                                <Form.Check
                                    type="checkbox"
                                    className="mb-2 mr-sm-2"
                                    id={`checkbox-${wall.which}`}
                                    label={`Mur ${wall.which}`}
                                    checked={wall.exists}
                                    onChange={(e) => this.setWall(wall.which, e.currentTarget.checked)}
                                />
                                {wall.exists &&
                                    <Form.Control
                                        style={{ width: '70px' }}
                                        as="input"
                                        htmlSize={4}
                                        size="sm"
                                        type="number"
                                        step={10}
                                        inputMode="numeric"
                                        id={`length-${wall.which}`}
                                        value={wall.length}
                                        onChange={(e) => this.setWallLength(wall.which, parseInt(e.target.value, 10))} />
                                }
                            </InputGroup>
                        </div>
                    ))}
                </Form.Row>
            </Form>
        )
    }
}
const mapStateToProps = (state) => {
    let walls = []
    if (state.currentScene)
        ['right', 'back', 'left'].map((wall) => {//push()!
            walls.push({
                which: wall,
                exists: state.currentScene.walls[wall] > 0,
                length: state.currentScene.walls[wall],
            })
        })
    return {
        // name: state.currentScene ? state.currentScene.name : "",
        walls
    }
}
const mapDispatchToProps = {
    setCurrentSceneProp,
    setCurrentSceneWall,
    setCurrentSceneWallLength
};
export default connect(mapStateToProps, mapDispatchToProps)(SceneConfig)