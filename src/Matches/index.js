import React from 'react';
import PropTypes from 'prop-types';
import MatchItem from '../MatchItem';
import { Container, List, Label, Modal, Button } from 'semantic-ui-react';

/**
 * This object renders the results of the search query on the web page. 
 * Each result item, or 'match', will display a title, description, and
 * sentiment value.
 */
export default class Matches extends React.Component {
  constructor(...props) {
    super(...props);

    this.state = {
      matches: this.props.matches || null,
      sessionToken: this.props.sessionToken || ''
    };
  }

  /**
   * getTitle - format title, setting backgroud color for all 
   * highlighted words.
   */
  getTitle(item) {
    if (item.highlight.showHighlight && item.highlight.titleIndexes.length > 0) {
      var str = '<style>hilite {background:#ffffb3;}</style>';
      item.highlight.titleIndexes.forEach(function(element) {
        str = str + item.title.substring(0, element.startIdx) +
          '<hilite>' +
          item.title.substring(element.startIdx, element.endIdx) +
          '</hilite>' +
          item.title.substring(element.endIdx);
      });
      return str;
    } else {
      return item.title ? item.title : 'No Title';
    }
  }

  /**
   * getText - format text, setting backgroud color for all
   * highlighted words.
   */
  getText(item, text) {
    if (item.highlight.showHighlight && item.highlight.textIndexes.length > 0) {
      var str = '<style>hilite {background:#ffffb3;}</style>';
      var currIdx = 0;

      item.highlight.textIndexes.forEach(function(element) {
        str = str + text.substring(currIdx, element.startIdx) +
          '<hilite>' +
          text.substring(element.startIdx, element.endIdx) +
          '</hilite>';
        currIdx = element.endIdx;
      });
      str = str + text.substring(currIdx);
      return str;
    } else {
      return text ? text : 'No Description';
    }
  }

  /**
   * getScore - round up to 4 decimal places.
   */
  getScore(item) {
    var score = '0.0';

    if (item.score) {
      score = item.score.toFixed(4);
    }
    return score;
  }

  /**
   * getSentiment - determine which icon to display to represent
   * positive, negative, and neutral sentiment.
   */
  getSentiment(item) {
    var score = Number(item.sentimentScore).toFixed(2);
    var color = 'grey';
    switch (item.sentimentLabel) {
    case 'negative':
      color='red';
      break;
    case 'positive':
      color='green';
      break;
    }

    return <Label
      className='sentiment-value'
      as='a'
      color={ color }
      size='tiny'
      tag>{ score  }</Label>;
  }

  /**
   * getMoreButton - the button user clicks to see full review, and
   * the contents of the modal dialog.
   */
  getMoreButton(item) {
    return <Modal
      trigger={ <Button className="review-button" onClick={this.buttonClicked.bind(this, item)}>more...</Button> } 
      closeIcon
      dimmer='blurring'
    >
      <Modal.Content>
        <div className="review-modal">
          <List.Item>
            <List.Content>
              <List.Header>
                <List.Description>
                  <h1>
                    <span dangerouslySetInnerHTML={{__html: this.getTitle(item)}}></span>
                  </h1>
                </List.Description>
              </List.Header>
            </List.Content>
            <List.Content>
              <List.Description>
                <h3>
                  <br/>
                  <span dangerouslySetInnerHTML={{__html: this.getText(item, item.textFull)}}></span>
                  <br/>
                </h3>
              </List.Description>
            </List.Content>
          </List.Item>
        </div>
      </Modal.Content>
    </Modal>;
  }

  /**
   * buttonClicked - user has clicked to see the full review.
   */
  buttonClicked(item) {
    // let our parent know
    const { sessionToken } = this.state;

    this.props.onGetFullReviewRequest({
      // params required for Discovery call to generate "user clicked" event
      sessionToken: sessionToken,
      documentId: item.id
    });
  }

  // Important - this is needed to ensure changes to main properties
  // are propagated down to our component. In this case, some other
  // search or filter event has occured which has changed the list of
  // items we are graphing, OR the graph data has arrived.
  static getDerivedStateFromProps(props, state) {
    if (props.matches !== state.matches) {
      return {
        matches: props.matches
      };
    }
    // no change in state
    return null;
  }

  /**
   * render - return a page full of reviews.
   */
  render() {
    const { matches } = this.state;

    return (
      <div>
        <Container textAlign='left'>
          <div className="matches--list">
            <List divided verticalAlign='middle'>
              {matches.map(item =>
                <MatchItem
                  key={ item.id }
                  title={ this.getTitle(item) }
                  text={ this.getText(item, item.textBlurb) }
                  moreButton= { this.getMoreButton(item) }
                  highlightText={ item.highlightText }
                  score={ this.getScore(item) }
                  date={ item.date }
                  sentiment={ this.getSentiment(item) }
                />)
              }
            </List>
          </div>
        </Container>
      </div>
    );
  }
}

// type check to ensure we are called correctly
Matches.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGetFullReviewRequest: PropTypes.func.isRequired,
  sessionToken: PropTypes.string.isRequired
};
