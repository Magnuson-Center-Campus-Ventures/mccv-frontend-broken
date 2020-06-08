/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import AddPostTitleLocation from './add-post-title-location';
import AddPostTiming from './add-post-timing';
import AddPostRequiredSkills from './add-post-req-skills';
import AddPostPreferredSkills from './add-post-pref-skills';
import AddPostIndustries from './add-post-industries';
import AddPostDesiredClasses from './add-post-desired-classes';
import AddPostDescription from './add-post-description';
import {
  fetchPost, updatePost, submitPost, fetchAllSkills, fetchAllIndustries, fetchAllClasses,
} from '../../../actions';

class AddPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
    };
  }

  componentDidMount() {
    this.props.fetchPost(this.props.post._id);
    this.props.fetchAllIndustries();
    this.props.fetchAllClasses();
    this.props.fetchAllSkills();
  }

  handlePageClick = (data) => {
    this.props.updatePost(this.props.post.id, this.props.post);
    this.setState({ index: data.selected });
    this.forceUpdate();
  };

  onSubmit = () => {
    this.props.submitPost(this.props.post.id, this.props.post, this.props.history);
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
        return <AddPostTitleLocation postID={this.props.post.id} />;
      case 1:
        return <AddPostDescription />;
      case 2:
        return <AddPostIndustries />;
      case 3:
        return <AddPostRequiredSkills />;
      case 4:
        return <AddPostPreferredSkills />;
      case 5:
        return <AddPostDesiredClasses />;
      case 6:
        return <AddPostTiming />;
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
          pageCount={7}
          marginPagesDisplayed={2}
          pageRangeDisplayed={8}
          onPageChange={this.handlePageClick}
        />
        {this.renderComponent()}
        {this.renderSubmit()}
      </div>
    );
  }
}

const mapStateToProps = (reduxState) => ({
  post: reduxState.posts.current,
});

export default withRouter(connect(mapStateToProps, {
  fetchPost, updatePost, submitPost, fetchAllSkills, fetchAllIndustries, fetchAllClasses,
})(AddPost));
