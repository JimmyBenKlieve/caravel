import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions';
import moment from 'moment';
import Link from './Link';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/styles';
import { Table } from 'reactable';
import { Alert } from 'react-bootstrap';

const STATE_COLOR_MAP = {
  failed: 'red',
  running: 'lime',
  success: 'green',
};

class QueryLog extends React.Component {
  render() {
    const activeQeId = this.props.tabHistory[this.props.tabHistory.length - 1];
    let data = this.props.queries.filter((q) => (q.sqlEditorId === activeQeId));
    data = data.map((query) => {
      const q = Object.assign({}, query);
      const since = (q.endDttm) ? q.endDttm : new Date();
      let duration = since.valueOf() - q.startDttm.valueOf();
      duration = moment.utc(duration);
      if (q.endDttm) {
        q.duration = duration.format('HH:mm:ss.SS');
      }
      q.started = moment(q.startDttm).format('HH:mm:ss');
      q.sql = <SyntaxHighlighter language="sql" style={github}>{q.sql}</SyntaxHighlighter>;
      q.state = (
        <span
          className="label label-default"
          style={{ backgroundColor: STATE_COLOR_MAP[q.state] }}
        >
          {q.state}
        </span>
      );
      q.actions = (
        <div>
          <Link
            className="fa fa-plus-circle"
            tooltip="Pop a tab containing this query"
            href="#"
          />
          <Link
            className="fa fa-trash"
            href="#"
            tooltip="Remove query from log"
            onClick={this.props.actions.removeQuery.bind(this, query)}
          />
          <Link
            className="fa fa-map-pin"
            tooltip="Pin this query to the top of this query log"
            href="#"
          />
        </div>
      );

      return q;
    }).reverse();
    if (data.length > 0) {
      return (
        <Table
          columns={['state', 'started', 'duration', 'rows', 'sql', 'actions']}
          className="table table-condensed"
          data={data}
        />
      );
    }
    return (
      <Alert bsStyle="info">
        No query history yet...
      </Alert>
    );
  }
}
QueryLog.defaultProps = {
  queries: [],
};

QueryLog.propTypes = {
  queries: React.PropTypes.array,
  tabHistory: React.PropTypes.array,
  actions: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    queries: state.queries,
    tabHistory: state.tabHistory,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(QueryLog);
