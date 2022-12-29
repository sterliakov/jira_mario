import api, {route} from '@forge/api';
import {format} from 'date-fns';

import {REQUIRED_ISSUE_FIELDS} from './constants';

export const getDataFromJira = async (url) => {
    try {
        const response = await api.asUser().requestJira(url);
        return await response.json();
    } catch (error) {
        console.log('getDataFromJira error: ', error);
        throw error;
    }
};

export const generateLinkedIssuesData = (issueLinks) => () => {
    return Promise.all(
        issueLinks
            .filter(
                (link) => link.hasOwnProperty('inwardIssue'), // eslint-disable-line
            )
            .map(async (link) => {
                if (link.inwardIssue) {
                    const assignee = await getDataFromJira(
                        // eslint-disable-next-line max-len
                        route`/rest/api/3/issue/${link.inwardIssue.key}?fields=assignee&expand=versionedRepresentations`,
                    );

                    return {
                        link,
                        assignee: assignee
                            ? assignee.versionedRepresentations.assignee[1]
                            : null,
                    };
                }
            }),
    );
};

export const composeGetIssueUrl = (issueKey, sprintCustomFieldKey) =>
    // eslint-disable-next-line max-len
    route`/rest/api/3/issue/${issueKey}?fields=${sprintCustomFieldKey}issuelinks,assignee,statuscategorychangedate,comment`;

export const composeOldSprintsUrl = (projectKey, sprintId, baseUrl) =>
    // eslint-disable-next-line max-len
    `${baseUrl}/secure/RapidBoard.jspa?rapidView=2&projectKey=${projectKey}&view=reporting&chart=sprintRetrospective&sprint=${sprintId}`;

export const pluralizeString = (num) => (num > 1 ? 's' : '');

export const generateOldSprints = (sprintCustomField, timeConfig) =>
    sprintCustomField
        ? sprintCustomField.reduce(
              (sprintNames, currentSprint) =>
                  currentSprint.state === 'closed'
                      ? [
                            ...sprintNames,
                            {
                                name: currentSprint.name,
                                startDate: format(
                                    new Date(currentSprint.startDate),
                                    timeConfig,
                                ),
                                boardId: currentSprint.boardId,
                                id: currentSprint.id,
                            },
                        ]
                      : sprintNames,
              [],
          )
        : [];

export const mapIssueStatusToLozengeAppearance = (issueStatus) => {
    switch (issueStatus) {
        case 'new':
            return 'new';
        case 'done':
            return 'success';
        case 'indeterminate':
            return 'dafault';
        default:
            return 'inprogress';
    }
};

export const sendEmailToAssignee = async (issueKey, notifyBody) => {
    const body = {
        htmlBody: notifyBody,
        subject: 'Issue Health Monitor',
        to: {
            voters: false,
            watchers: false,
            groups: [
                {
                    name: 'jira-software-users',
                },
            ],
            reporter: false,
            assignee: true,
            users: [],
        },
        restrict: {
            permissions: [],
            groups: [],
        },
    };
    const response = await api
        .asUser()
        .requestJira(route`/rest/api/3/issue/${issueKey}/notify`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
};

const issueChangelogTransformer = (response) => {
    if (!response) return [];
    const filteredResponse = response.values.filter((value) =>
        value.items.some((item) => item.fieldId === 'assignee'),
    );
    return filteredResponse.length !== 0
        ? filteredResponse
              .map((changelogItem) => ({
                  ...changelogItem,
                  items: changelogItem.items.find(
                      (item) => item.fieldId === 'assignee',
                  ),
              }))
              .reverse()
        : [];
};

export const getIssueChangelog = async (issueKey) => {
    const response = await getDataFromJira(
        route`/rest/api/3/issue/${issueKey}/changelog`,
    );
    return issueChangelogTransformer(response);
};

const projectsTransformer = (response) => {
    if (!response) return [];
    return response.values.map(({key, name}) => ({key, name}));
};

export const getProjects = async () => {
    const response = await getDataFromJira(route`/rest/api/3/project/search`);
    return projectsTransformer(response);
};

export const transformIssueData = (issueData) => {
    const {fields} = issueData;

    return REQUIRED_ISSUE_FIELDS.reduce((issueFieldsMap, field) => {
        issueFieldsMap[field] = fields[field];
        return issueFieldsMap;
    }, {});
};
