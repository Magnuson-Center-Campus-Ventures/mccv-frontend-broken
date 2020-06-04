import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import Switch from 'react-switch';
import StartupListItem from './startup-item';
import SearchBar from './search-bar';
import { fetchStartups, fetchUser } from '../../actions';
import '../../styles/postings.scss';


class Startups extends Component {
  constructor(props) {
    super(props);

    this.state = {
      industryOptions: [],
      selectedIndustryOptions: [],
      locationOptions: [],
      selectedLocationOptions: [],
      searchterm: 'filler',
      search: false,
      filter: false,
      archive: false,
      approved: [],
      pending: false,
      results: [],
    };
    this.handleArchiveChange = this.handleArchiveChange.bind(this);
    // this.handleApprovedChange = this.handleApprovedChange.bind(this);
    this.handlePendingChange = this.handlePendingChange.bind(this);
  }

  componentDidMount() {
    this.props.fetchStartups();
    this.props.fetchUser(localStorage.getItem('userID'));
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.startups.length > 0) {
      const industryOptions = [];
      const locationOptions = [];
      nextProps.startups.forEach((startup) => {
        if (startup.industries) {
          startup.industries.forEach((industry) => {
            // Add option if it's not already in the array (not using sets because react-select expects an array)
            if (industryOptions.filter((option) => option.value === industry.name).length === 0) {
              industryOptions.push({ value: industry.name, label: industry.name });
            }
          });
        }
        if (startup.city && startup.state) {
          const locationString = `${startup.city}, ${startup.state}`;
          if (locationOptions.filter((option) => option.value === locationString).length === 0) {
            locationOptions.push({ value: locationString, label: locationString });
          }
        }
      });
      if (industryOptions.length > prevState.industryOptions.length
        || locationOptions.length > prevState.locationOptions.length) {
        return {
          industryOptions, locationOptions,
        };
      }
    }
    // Return null if the state hasn't changed
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.startups.length > 0 // && this.props.student !== {}
      && (prevProps.startups !== this.props.startups)) {
      // Score posts
      this.loadApproved();
      console.log('here');
    }
  }

  searchAndFilter = (text, selectedIndustries, selectedLocations) => {
    this.setState({ results: [] });
    const searchterm = text.toLowerCase();
    this.state.startups.forEach((startup) => {
      const industries = startup.industries.map((industry) => industry.name.toLowerCase());
      const location = `${startup.city}, ${startup.state}`;
      // Checks for search
      if (startup.name.toLowerCase().includes(searchterm)
      || startup.city.toLowerCase().includes(searchterm)
      || startup.state.toLowerCase().includes(searchterm)
      || startup.description.toLowerCase().includes(searchterm)
      || industries.includes(searchterm) // array
      // Checks for filter
      || selectedIndustries.some((industry) => industries.includes(industry))
      || selectedLocations.includes(location)) {
        this.setState((prevState) => ({
          results: [...prevState.results, startup],
        }));
      }
    });
  }

  onSearch = (text) => {
    const industries = (this.state.selectedIndustryOptions && this.state.selectedIndustryOptions.length > 0)
      ? this.state.selectedIndustryOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];
    const locations = (this.state.selectedLocationOptions && this.state.selectedLocationOptions.length > 0)
      ? this.state.selectedLocationOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];
    this.searchAndFilter(text, industries, locations);
    this.setState({ search: true, searchterm: text });
  }

  isFilterEmpty = (array) => {
    return array.length === 1 && array.includes('emptytext');
  }

  onFilter = (industries, locations) => {
    if (this.isFilterEmpty(industries) && (this.isFilterEmpty(locations))) {
      this.setState({ filter: false });
    } else this.setState({ filter: true });
    this.searchAndFilter(this.state.searchterm, industries, locations);
  }

  clear = () => {
    this.setState({ search: false, searchterm: 'emptytext' });
    const industries = (this.state.selectedIndustryOptions && this.state.selectedIndustryOptions.length > 0)
      ? this.state.selectedIndustryOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];
    const locations = (this.state.selectedLocationOptions && this.state.selectedLocationOptions.length > 0)
      ? this.state.selectedLocationOptions.map((option) => option.value.toLowerCase())
      : ['emptytext'];
    this.searchAndFilter('emptytext', industries, locations);
  }

  loadApproved() {
    this.props.startups.forEach((startup) => {
      if (startup.status === 'Approved') {
        this.setState((prevState) => ({
          approved: [...prevState.approved, startup],
        }));
      }
    });
  }

  handleArchiveChange(checked) {
    this.setState({ archive: checked });
    this.setState({ results: [] });
    if (checked) {
      this.props.startups.forEach((startup) => {
        if (startup.status === 'Archived') {
          this.setState((prevState) => ({
            results: [...prevState.results, startup],
          }));
        }
      });
    }
  }

  handleApprovedChange(checked) {
    this.setState({ approved: checked });
    this.setState({ results: [] });
    if (checked) {
      this.props.startups.forEach((startup) => {
        if (startup.status === 'Approved') {
          this.setState((prevState) => ({
            results: [...prevState.results, startup],
          }));
        }
      });
    }
  }

  handlePendingChange(checked) {
    this.setState({ pending: checked });
    this.setState({ results: [] });
    if (checked) {
      this.props.startups.forEach((startup) => {
        if (startup.status === 'Pending') {
          this.setState((prevState) => ({
            results: [...prevState.results, startup],
          }));
        }
      });
    }
  }

  renderStartups() {
    if (this.state.search || this.state.filter || this.state.archive || this.state.pending) {
      if (this.state.results.length > 0) {
        return this.state.results.map((startup) => {
          return (
            <StartupListItem startup={startup} key={startup.id} />
          );
        });
      } else {
        return (
          <div> Sorry, no postings match that query</div>
        );
      }
    } else {
      return this.state.approved.map((startup) => {
        return (
          <StartupListItem startup={startup} key={startup.id} />
        );
      });
    }
  }

  renderToggles() {
    if (this.props.user.role === 'admin') {
      return (
        <div id="filters">
          {/* <h3>show approved startups: </h3>
          <Switch id="approvedToggle" onChange={this.handleApprovedChange} checked={this.state.approved} /> */}
          <h3>show pending startups:</h3>
          <Switch id="pendingToggle" onChange={this.handlePendingChange} checked={this.state.pending} />
          <h3>show archived startups:</h3>
          <Switch id="archiveToggle" onChange={this.handleArchiveChange} checked={this.state.archive} />
        </div>
      );
    } else {
      return (<div> </div>);
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
      this.props.startups && this.state.results
        ? (
          <div>
            <SearchBar onSearchChange={this.onSearch} onNoSearch={this.clear} />
            <Select
              isMulti
              styles={dropdownStyles}
              name="industry-filter"
              placeholder="Filter by industry"
              options={this.state.industryOptions}
              value={this.state.selectedIndustryOptions}
              onChange={(selectedOptions) => {
                this.setState({ selectedIndustryOptions: selectedOptions });
                const industries = (selectedOptions && selectedOptions.length > 0)
                  ? selectedOptions.map((option) => option.value.toLowerCase())
                  : ['emptytext'];
                const locations = (this.state.selectedLocationOptions && this.state.selectedLocationOptions.length > 0)
                  ? this.state.selectedLocationOptions.map((option) => option.value)
                  : ['emptytext'];
                this.onFilter(industries, locations);
              }}
            />
            <Select
              isMulti
              styles={dropdownStyles}
              name="location-filter"
              placeholder="Filter by location"
              options={this.state.locationOptions}
              value={this.state.selectedLocationOptions}
              onChange={(selectedOptions) => {
                this.setState({ selectedLocationOptions: selectedOptions });
                const industries = (this.state.selectedIndustryOptions && this.state.selectedIndustryOptions.length > 0)
                  ? this.state.selectedIndustryOptions.map((option) => option.value.toLowerCase())
                  : ['emptytext'];
                const locations = (selectedOptions && selectedOptions.length > 0)
                  ? selectedOptions.map((option) => option.value)
                  : ['emptytext'];
                this.onFilter(industries, locations);
              }}
            />
            {this.renderToggles()}
            <div className="list">
              {this.renderStartups()}
            </div>
          </div>
        ) : (
          <div> </div>
        )
    );
  }
}

const mapStateToProps = (reduxState) => ({
  startups: reduxState.startups.all,
  user: reduxState.user.current,
});

export default withRouter(connect(mapStateToProps, { fetchStartups, fetchUser })(Startups));
