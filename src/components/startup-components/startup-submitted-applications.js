/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Select from 'react-select';
import SearchBar from '../student-components/search-bar';
import {
  fetchSubmittedApplication, fetchSubmittedApplications, fetchPosts, fetchStartupByUserID,
} from '../../actions';
import '../../styles/applications.scss';

class SubmittedApplications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startupApplications: [],
      statusOptions: [],
      applicationToTitle: {},
      selectedStatusOptions: [],
      titleOptions: [],
      selectedTitleOptions: [],
      searchterm: 'emptytext',
      search: false,
      filter: false,
      results: [],
    };
    this.filterByCompany = this.filterByCompany.bind(this);
  }

  componentDidMount() {
    this.props.fetchStartupByUserID(localStorage.getItem('userID'));
    this.props.fetchSubmittedApplications();
    this.props.fetchPosts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.submittedApplications.length > 0 && this.props.posts.length > 0
      && (prevProps.submittedApplications !== this.props.submittedApplications || prevProps.posts !== this.props.posts)) {
      this.filterByCompany();
    }
  }

  searchAndFilter = (text, selectedStatuses, selectedTitles) => {
    this.setState({ results: [] });
    const searchterm = text.toLowerCase();
    const { startupApplications } = this.state;
    startupApplications.map((application) => {
      if (application.status.toLowerCase().includes(searchterm)
      || this.state.applicationToTitle[application.post_id].toLowerCase().includes(searchterm)
      // Checks for filter
      || selectedStatuses.some((status) => application.status.toLowerCase().includes(status))
      || selectedTitles.some((title) => this.state.applicationToTitle[application.post_id].toLowerCase().includes(title))) {
        this.setState((prevState) => ({
          results: [...prevState.results, application],
        }));
      }
    });
  }

  onSearch = (text) => {
    const statuses = (this.state.selectedStatusOptions && this.state.selectedStatusOptions.length > 0)
      ? this.state.selectedStatusOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];

    const titles = (this.state.selectedTitleOptions && this.state.selectedTitleOptions.length > 0)
      ? this.state.selectedTitleOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];
    this.searchAndFilter(text, statuses, titles);
    this.setState({ search: true, searchterm: text });
  }

  isFilterEmpty = (array) => {
    return array.length === 1 && array.includes('emptytext');
  }

  onFilter = (statuses, titles) => {
    if (this.isFilterEmpty(statuses) && this.isFilterEmpty(titles)) {
      this.setState({ filter: false });
    } else this.setState({ filter: true });
    this.searchAndFilter(this.state.searchterm, statuses, titles);
  }

  clear = () => {
    this.setState({ search: false, searchterm: 'emptytext' });
    const statuses = (this.state.selectedStatusOptions && this.state.selectedStatusOptions.length > 0)
      ? this.state.selectedStatusOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];
    const titles = (this.state.selectedTitleOptions && this.state.selectedTitleOptions.length > 0)
      ? this.state.selectedTitleOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];
    this.searchAndFilter('emptytext', statuses, titles);
  }

  filterByCompany() {
    const startupPostIds = [];
    const updatedStartupApplications = [];
    this.props.posts.map((post) => {
      if (post.startup_id._id === this.props.startup._id) {
        startupPostIds.push(post._id);
      }
    });
    this.props.submittedApplications.map((application) => {
      if (startupPostIds.includes(application.post_id)) {
        updatedStartupApplications.push(application);
      }
    });
    if (updatedStartupApplications.length > 0) {
      const newStatusOptions = [];
      const newTitleOptions = [];
      const newApplicationToTitle = {};
      updatedStartupApplications.forEach((application) => {
        // Add option if it's not already in the array (not using sets because react-select expects an array)
        if (newStatusOptions.filter((option) => option.value === application.status).length === 0) {
          newStatusOptions.push({ label: application.status, value: application.status });
        }
      });
      this.props.posts.forEach((post) => {
        if (startupPostIds.includes(post._id)) {
          // Add option if it's not already in the array (not using sets because react-select expects an array)
          if (newTitleOptions.filter((option) => option.value === post.title).length === 0) {
            newTitleOptions.push({ label: post.title, value: post.title });
          }
          newApplicationToTitle[post._id] = post.title;
        }
      });
      this.setState({
        startupApplications: updatedStartupApplications, statusOptions: newStatusOptions, titleOptions: newTitleOptions, applicationToTitle: newApplicationToTitle,
      });
    }
  }


  renderApplications() {
    if (this.state.search || this.state.filter) {
      if (this.state.results.length > 0) {
        return this.state.results.map((application) => {
          const route = `/startupsubmittedapplications/${application._id}`;
          let post = '';
          for (const i in this.props.posts) {
            if (this.props.posts[i].id === application.post_id) {
              post = this.props.posts[i];
              break;
            }
          }
          return (
            <Link to={route} key={application._id} className="listItem link">
              <div className="Status">
                <div>{post.title}</div>
                <div>{post.location}</div>
                <div>status: {application.status}</div>
              </div>
            </Link>
          );
        });
      } else {
        return (
          <div> Sorry, no applications match that query</div>
        );
      }
    } else {
      const { startupApplications } = this.state;
      return startupApplications.map((application) => {
        const route = `/startupsubmittedapplications/${application._id}`;
        let post = '';
        for (const i in this.props.posts) {
          if (this.props.posts[i].id === application.post_id) {
            post = this.props.posts[i];
            break;
          }
        }
        return (
          <Link to={route} key={application.id} className="listItem link">
            <div className="Status">
              <div>{post.title}</div>
              <div>{post.location}</div>
              <div>status: {application.status}</div>
            </div>
          </Link>
        );
      });
    }
  }

  render() {
    // Styles for filter dropdowns
    const dropdownStyles = {
      control: (base) => ({
        ...base,
        width: 200,
      }),
    };
    return (
      (this.state.startupApplications !== undefined || null) && (this.state.results !== null || undefined)
        ? (
          <div>
            <SearchBar onSearchChange={this.onSearch} onNoSearch={this.clear} />
            <Select
              isMulti
              styles={dropdownStyles}
              name="status-filter"
              placeholder="Filter by Status"
              options={this.state.statusOptions}
              value={this.state.selectedStatusOptions}
              onChange={(selectedOptions) => {
                this.setState({ selectedStatusOptions: selectedOptions });
                const titles = (this.state.selectedTitleOptions && this.state.selectedTitleOptions.length > 0)
                  ? this.state.selectedTitleOptions.map((option) => option.value.toLowerCase())
                  : ['emptytext'];
                const statuses = (selectedOptions && selectedOptions.length > 0)
                  ? selectedOptions.map((option) => option.value.toLowerCase())
                  : ['emptytext'];
                this.onFilter(statuses, titles);
              }}
            />
            <Select
              isMulti
              styles={dropdownStyles}
              name="title-filter"
              placeholder="Filter by Title"
              options={this.state.titleOptions}
              value={this.state.selectedTitleOptions}
              onChange={(selectedOptions) => {
                this.setState({ selectedTitleOptions: selectedOptions });
                const titles = (selectedOptions && selectedOptions.length > 0)
                  ? selectedOptions.map((option) => option.value.toLowerCase())
                  : ['emptytext'];
                const statuses = (this.state.selectedStatusOptions && this.state.selectedStatusOptions.length > 0)
                  ? this.state.selectedStatusOptions.map((option) => option.value.toLowerCase())
                  : ['emptytext'];
                this.onFilter(statuses, titles);
              }}
            />
            <div className="list">
              {this.renderApplications()}
            </div>
          </div>

        ) : (
          <div>Loading...</div>
        )
    );
  }
}
const mapStateToProps = (reduxState) => ({
  userID: reduxState.auth.userID,
  startup: reduxState.startups.current,
  submittedApplications: reduxState.submittedApplications.all,
  posts: reduxState.posts.all,
});

export default withRouter(connect(mapStateToProps, {
  fetchPosts, fetchSubmittedApplication, fetchSubmittedApplications, fetchStartupByUserID,
})(SubmittedApplications));
