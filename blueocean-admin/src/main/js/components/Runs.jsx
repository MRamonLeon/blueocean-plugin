import React, { Component, PropTypes } from 'react';
import ajaxHoc from '../AjaxHoc';
import moment from 'moment';
import { CommitHash, ReadableDate, ModalView } from '@jenkins-cd/design-language';
import { ModalBody, StatusIndicator, LogConsole } from '@jenkins-cd/design-language';

const { object, string, any } = PropTypes;

require('moment-duration-format');

/*
 http://localhost:8080/jenkins/blue/rest/organizations/jenkins/pipelines/PR-demo/runs
 */
export default class Runs extends Component {
    constructor(props) {
        super(props);
        this.state = { isVisible: false };
    }
    render() {
        const { result, changeset, data } = this.props;
        // early out
        if (!result && !data) {
            return null;
        }

        const duration = moment.duration(result.durationInMillis).humanize();
        const name = decodeURIComponent(result.pipeline);
        const afterClose = () => this.setState({ isVisible: false });
        const open = () => this.setState({ isVisible: true });
        const resultRun = result.result === 'UNKNOWN' ? result.state : result.result;
        return (<tr key={result.id}>
            <td>
                {
                    this.state.isVisible && <ModalView hideOnOverlayClicked
                      title={`Branch ${name}`}
                      isVisible={this.state.isVisible}
                      afterClose={afterClose}
                    >
                        <ModalBody>
                            <div>
                                <dl>
                                    <dt>Status</dt>
                                    <dd>
                                        <StatusIndicator result={resultRun} />
                                    </dd>
                                    <dt>Build</dt>
                                    <dd>{result.id}</dd>
                                    <dt>Commit</dt>
                                    <dd><CommitHash commitId={changeset && changeset.commitId} />
                                    </dd>
                                    <dt>Branch</dt>
                                    <dd>{name}</dd>
                                    <dt>Message</dt>
                                    <dd>{changeset && changeset.comment || '-'}</dd>
                                    <dt>Duration</dt>
                                    <dd>{duration}</dd>
                                    <dt>Completed</dt>
                                    <dd><ReadableDate date={result.endTime} /></dd>
                                </dl>
                                 <LogConsole key={`${result.id}${name}`} result={data} />
                            </div>
                        </ModalBody>
                    </ModalView>
                }
                <a className="status-link" onClick={open}>
                    <StatusIndicator result={resultRun} />
                </a>
            </td>
            <td>{result.id}</td>
            <td><CommitHash commitId={changeset.commitId} /></td>
            <td>{name}</td>
            <td>{changeset && changeset.comment || '-'}</td>
            <td>{duration}</td>
            <td><ReadableDate date={result.endTime} /></td>
        </tr>);
    }
}

Runs.propTypes = {
    result: any.isRequired, // FIXME: create a shape
    data: string,
    changeset: object.isRequired,
    pipeline: object,
};
// Decorated for ajax
export default ajaxHoc(Runs, ({ branchNames, name, result }, config) => {
    const multiBranch = !!branchNames;
    const baseUrl = `${config.getAppURLBase()}/rest/organizations/jenkins` +
        `/pipelines/${name}`;
    let url;
    if (multiBranch) {
        url = `${baseUrl}/branches/${encodeURI(result.pipeline)}/runs/${result.id}/log/`;
    } else {
        url = `${baseUrl}/runs/${result.id}/log/`;
    }
    return url;
}, false);
