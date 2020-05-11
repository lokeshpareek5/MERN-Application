import React, {Fragment} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import './App.css';

const App = () => (
  <Router>
    <Fragment>
      <NavBar />
      <Route exact path="/" component={Landing} />
      <section className="container">
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
      </section>
    </Fragment>
  </Router>
) 

export default App;
