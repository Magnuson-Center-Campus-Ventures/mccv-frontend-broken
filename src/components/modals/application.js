/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { submitApplication } from '../../actions';
import '../../styles/application.scss';

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questionToAnswer: {},
    };
    this.onAnswerChange = this.onAnswerChange.bind(this);
  }

  onClose = (e) => {
    const newApplication = {
      student_id: '5ec989b5b73b4100389ff681',
      post_id: this.props.current.id,
      responses: this.state.questionToAnswer,
      status: 'pending',
    };
    console.log(newApplication);
    this.props.submitApplication(newApplication);
    this.props.onClose && this.props.onClose(e);
  };

  onAnswerChange(event) {
    const { target: { name, value } } = event;
    const newQuestionToAnswer = { ...this.state.questionToAnswer, [name]: value };
    this.setState({ questionToAnswer: newQuestionToAnswer });
  }

  renderHelper= () => {
    const items = [];
    if (this.props.application.questions) {
      for (const [index, value] of this.props.application.questions.entries()) {
        items.push(
          // eslint-disable-next-line no-loop-func
          <div>
            <h3 id="question" key={index}>{value}</h3>
            <input name={value} onChange={this.onAnswerChange} value={this.state.questionToAnswer[value]} />
          </div>,
        );
      }
      return items;
    } else {
      return <div />;
    }
  }

  render() {
    if (!this.props.show) {
      return null;
    }
    return (
      <div className="application-container">
        <div id="application" className="application">
          <div className="title">{this.props.current.title}</div>
          <div className="questions">
            {this.renderHelper()}
          </div>
          <div className="actions">
            <button type="submit"
              className="submit-btn"
              onClick={(e) => {
                this.onClose(e);
              }}
            >
              Submit
            </button>
          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = (reduxState) => ({
  current: reduxState.posts.current,
  application: reduxState.application.current,
});

export default withRouter(connect(mapStateToProps, { submitApplication })(Application));
