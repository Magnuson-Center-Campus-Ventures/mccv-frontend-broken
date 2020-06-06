/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import TitleLocation from './add-post-title-location';
import Timing from './add-post-timing';
import RequiredSkills from './add-post-req-skills';
import PreferredSkills from './add-post-pref-skills';
import Industries from './add-post-industries';
import DesiredClasses from './add-post-desired-classes';
import Description from './add-post-description';
import {
  fetchStartupByUserID, fetchUser, updateStartup, submitStartup, fetchAllSkills, fetchAllIndustries, fetchAllClasses,
} from '../../../actions';

class StartupSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
    };
  }

  componentDidMount() {
    this.props.fetchStartupByUserID(this.props.userID);
    this.props.fetchUser(this.props.userID);
    this.props.fetchAllIndustries();
    this.props.fetchAllClasses();
    this.props.fetchAllSkills();
  }

  handlePageClick = (data) => {
    this.props.updateStartup(this.props.startup.id, this.props.startup);
    this.setState({ index: data.selected });
    this.forceUpdate();
  };

  onSubmit = () => {
    this.props.submitStartup(this.props.startup.id, this.props.startup, this.props.history);
  }

  renderSubmit() {
    if (this.state.index === 3) {
      return (
        <div className="buttonContainer">
          <button type="submit" className="submit-btn" style={{ cursor: 'pointer' }} onClick={this.onSubmit}>
            Submit!
          </button>
        </div>
      );
    } else {
      return (
        <div className="empty" />
      );
    }
  }

  renderComponent() {
    switch (this.state.index) {
      case 0:
        return <TitleLocation />;
      default:
        return <div>Out of pages!</div>;
    }
  }

  render() {
    return (
      <div className="paginator">
        <ReactPaginate
          previousLabel="previous"
          nextLabel="next"
          breakLabel="..."
          // breakClassName="break-me"
          pageCount={4}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageClick}
          // containerClassName="pagination"
          // subContainerClassName="pages pagination"
          // activeClassName="active"
        />
        {this.renderComponent()}
        {this.renderSubmit()}
      </div>
    );
  }
}

const mapStateToProps = (reduxState) => ({
  userID: reduxState.auth.userID,
  startup: reduxState.startups.current,
});

export default withRouter(connect(mapStateToProps, {
  fetchStartupByUserID, fetchUser, updateStartup, submitStartup, fetchAllSkills, fetchAllIndustries, fetchAllClasses,
})(StartupSignUp));
