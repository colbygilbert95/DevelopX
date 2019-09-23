
CREATE TABLE Fork_Networks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root_project_id INTEGER,
    deleted_root_project_name TEXT,

    FOREIGN KEY(root_project_id) REFERENCES Projects(id) ON UPDATE SET NULL
);

CREATE UNIQUE INDEX index_fork_networks_on_root_project_id ON Fork_Networks(root_project_id);

CREATE TABLE Fork_Network_Members(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fork_network_id INTEGER,
    project_id INTEGER,
    forked_from_project_id INTEGER,

    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(forked_from_project_id) REFERENCES Projects(id) ON UPDATE SET NULL,
    FOREIGN KEY(fork_network_id) REFERENCES Fork_Networks(id) ON UPDATE CASCADE
)

CREATE INDEX index_fork_network_members_on_fork_network_id ON Fork_Network_Members(fork_network_id);
CREATE INDEX index_fork_network_members_on_forked_from_project_id ON Fork_Network_Members(forked_from_project_id);
CREATE UNIQUE INDEX index_fork_network_members_on_project_id ON Fork_Network_Members(project_id);

CREATE TABLE Forked_Network_Links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    forked_to_project_id INTEGER,
    forked_from_project_id INTEGER,
    created_at INTEGER,
    updated_at INTEGER,

    FOREIGN KEY(forked_to_project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(forked_from_project_id) REFERENCES Projects(id) ON UPDATE CASCADE
)

CREATE INDEX index_forked_project_links_on_forked_to_project_id ON Forked_Network_Links(forked_to_project_id)

CREATE TABLE Issues(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author_id TEXT,
    project_id INTEGER,
    created_at INTEGER,
    updated_at INTEGER,
    description TEXT,
    state TEXT,
    iid INTEGER, 
    updated_by_id INTEGER,
    wieght INTEGER,
    confidential INTEGER DEFAULT 0, --BOOLEAN
    due_date INTEGER,
    --moved_to_id INTEGER,
    lock_version INTEGER,
    time_estimate INTEGER,
    last_edit_at INTEGER,
    last_edit_by_id INTEGER,
    discussion_locked INTEGER DEFAULT 0, --BOOLEAN
    closed_at INTEGER,
    closed_by_id INTEGER,
    --duplicated_to_id INTEGER,

    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(author_id) REFERENCES Users(id) ON UPDATE SET NULL,
    FOREIGN KEY(closed_by_id) REFERENCES Users(id) ON UPDATE SET NULL,
    FOREIGN KEY(updated_by_id) REFERENCES Users(id) ON UPDATE SET NULL,
    -- FOREIGN KEY(duplicated_to_id) REFERENCES Issues(id) ON UPDATE SET NULL,
    -- FOREIGN KEY(moveded_to_id) REFERENCES Issues(id) ON UPDATE SET NULL,

)

CREATE INDEX index_issues_on_author_id ON Issues(author_id);
CREATE INDEX index_issues_on_closed_by_id ON Issues(closed_by_id);
CREATE INDEX index_issues_on_duplicated_to_id ON Issues(duplicated_to_id) WHERE duplicated_to_id <> NULL;
CREATE INDEX index_issues_on_moved_to_id ON Issues(moved_to_id) WHERE moved_to_id <> NULL;
CREATE INDEX index_issues_on_project_id_and_created_at_and_id_and_state ON Issues(project_id, created_at, id, state);
CREATE INDEX idx_issues_on_project_id_and_due_date_and_id_and_state_partial ON Issues(project_id, due_date, id, state) WHERE due_date <> NULL;
CREATE UNIQUE INDEX index_issues_on_project_id_and_iid ON Issues(project_id, iid);
CREATE INDEX index_issues_on_project_id_and_rel_position_and_state_and_id ON Issues(id, project_id, updated_at, state);
CREATE INDEX index_issues_on_state ON Issues(state);
CREATE INDEX index_issues_on_updated_at ON Issues(updated_at);
CREATE INDEX index_issues_on_updated_by_id ON Issues(updated_by_id) WHERE updated_by_id <> NULL;

CREATE TABLE Issue_Assignees(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    issue_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id) ON UPDATE CASCADE,
    FOREIGN KEY(issue_id) REFERENCES Issues(id)ON UPDATE CASCADE
)

CREATE UNIQUE INDEX index_issue_assignees_on_issue_id_and_user_id ON Issue_Assignees(issue_id, user_id);
CREATE INDEX index_issue_assignees_on_user_id ON Issue_Assignees(user_id) ;

CREATE TABLE Issue_Links(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    target_id INTEGER,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY(source_id) REFERENCES Issues(id) ON UPDATE CASCADE,
    FOREIGN KEY(target_id) REFERENCES Issues(id) ON UPDATE CASCADE
)

CREATE UNIQUE INDEX index_issue_links_on_source_id_and_target_id ON Issue_Links(source_id, target_id);
CREATE INDEX index_issue_links_on_source_id ON Issue_Links(source_id);
CREATE INDEX index_issue_links_on_target_id ON Issue_Links(target_id);

CREATE TABLE Merge_Requests(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_branch TEXT,
    source_branch TEXT,
    source_project_id INTEGER,
    author_id INTEGER,
    title TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    state TEXT DEFAULT "opened",
    merge_status TEXT DEFAULT "unchecked"
    target_project_id INTEGER,
    iid INTEGER,
    description TEXT,
    updated_by_id INTEGER,
    merge_error TEXT,
    merge_params TEXT,
    merge_user_id INTEGER,
    merge_commit_sha TEXT,
    approvals_before_merge INTEGER,
    lock_version INTEGER,
    time_estimate INTEGER,
    last_edited_at INTEGER,
    last_edited_by_id INTEGER,
    discussion_locked INTEGER DEFAULT 0, --BOOLEAN
    allow_maintainer_to_push INTEGER DEFAULT 1, --BOOLEAN

    FOREIGN KEY(source_project_id) REFERENCES Projects(id) ON UPDATE SET NULL,
    FOREIGN KEY(target_project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(assignee_id) REFERENCES Users(id) ON UPDATE CASCADE,
    FOREIGN KEY(author_id) REFERENCES Users(id) ON UPDATE CASCADE,
    FOREIGN KEY(merge_user_id) REFERENCES Users(id) ON UPDATE CASCADE,
    FOREIGN KEY(update_by_id) REFERENCES Users(id) ON UPDATE CASCADE,

)

CREATE INDEX index_merge_requests_on_assignee_id ON Merge_Requests(assignee_id);
CREATE INDEX index_merge_requests_on_author_id ON Merge_Requests(author_id);
CREATE INDEX index_merge_requests_on_created_at ON Merge_Requests(created_at);
CREATE INDEX index_merge_requests_on_merge_user_id ON Merge_Requests(merge_user_id) WHERE merge_user_id <> NULL;
CREATE INDEX index_merge_requests_on_milestone_id ON Merge_Requests(milestone_id);
CREATE INDEX index_merge_requests_on_source_branch ON Merge_Requests(source_branch);
CREATE INDEX index_merge_requests_on_source_project_and_branch_state_opened ON Merge_Requests(source_project_id, source_branch) WHERE state EQUALS "opened";
CREATE INDEX index_merge_requests_on_source_project_id_and_source_branch ON Merge_Requests(source_project_id, source_branch);
CREATE INDEX index_merge_requests_on_state_and_merge_status ON Merge_Requests(state, merge_status) WHERE state EQUALS "opened" AND merge_status EQUALS "can_be_merged"
CREATE INDEX index_merge_requests_on_target_branch ON Merge_Requests(target_branch);
CREATE UNIQUE INDEX index_merge_requests_on_target_project_id_and_iid ON Merge_Requests(target_project_id, iid);
CREATE INDEX index_merge_requests_on_target_project_id_and_iid_opened ON Merge_Requests(target_project_id, iid) WHERE state EQUALS "opened";
CREATE INDEX index_merge_requests_on_tp_id_and_merge_commit_sha_and_id ON Merge_Requests(target_project_id, merge_commit_sha, id);
CREATE INDEX index_merge_requests_on_title ON Merge_Requests(title);
CREATE INDEX index_merge_requests_on_updated_by_id ON Merge_Requests(updated_by_id) WHERE updated_by_id <> NULL;

CREATE TABLE Merge_Request_Assignees(
    user_id INTEGER,
    merge_request_id INTEGER,
    FOREIGN KEY(merge_request_id) REFERENCES Merge_Requests(id) ON UPDATE CASCADE,
    FOREIGN KEY(user_id) REFERENCES Users(id) ON UPDATE CASCADE

)

CREATE UNIQUE INDEX index_merge_request_assignees_on_merge_request_id_and_user_id WHERE Merge_Request_Assignees(merge_request_id, user_id);
CREATE INDEX index_merge_request_assignees_on_merge_request_id ON Merge_Request_Assignees(merge_request_id);
CREATE INDEX index_merge_request_assignees_on_user_id ON Merge_Request_Assignees(user_id);

CREATE TABLE Programming_Langauges(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    color TEXT,
    created_at INTEGER,
)

CREATE UNIQUE INDEX index_programming_languages_on_name ON Programming_Langauges(name);

CREATE TABLE Projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id TEXT ,
    project_name TEXT ,
    description TEXT,
    num_commits INTEGER, --to delete
    created_at INTEGER,
    last_commit INTEGER,
    path TEXT,
    last_activity_at INTEGER,
    updated_at INTEGER,
    visibility_lvl INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    avatar_path TEXT,
    approvals_before_merge INTEGER DEFAULT 0,
    reset_approvals_on_push INTEGER DEFAULT 1, -- BOOLEAN
    archived INTEGER DEFAULT 0, --BOOLEAN
);

CREATE INDEX index_projects_on_created_at ON Projects(created_at);
CREATE INDEX index_projects_on_creator_id ON Projects(creator_id);
--CREATE UNIQUE INDEX index_projects_on_id_partial_for_visibility  ON Projects(project_id) WHERE -- IS VISIBLE;
CREATE INDEX index_projects_on_last_activity_at ON Projects(last_activity_at);
CREATE INDEX index_projects_on_path ON Projects(path);
CREATE INDEX index_projects_on_like_count ON Projects(like_count);
CREATE INDEX index_projects_on_visibility_level ON Projects(visibility_level);

CREATE INDEX Project_Authorizations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    project_id INTEGER,
    access_level INTEGER,

    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(user_id) REFERENCES Users(id) ON UPDATE CASCADE
)

CREATE INDEX index_project_authorizations_on_project_id ON Project_Authorizations(project_id);
CREATE UNIQUE INDEX index_project_authorizations_on_user_id_project_id_access_level ON Project_Authorizations(user_id, project_id, access_level);

CREATE TABLE Releases(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT,
    description TEXT,
    project_id INTEGER,
    created_at INTEGER,
    updated_at INTEGER,
    author_id INTEGER
    name TEXT,
    sha TEXT,
    released_at INTEGER,

    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(author_id) REFERENCES Users(id) ON UPDATE CASCADE

)

CREATE INDEX index_releases_on_author_id ON Releases(author_id);
CREATE INDEX index_releases_on_project_id_and_tag ON Releases(project_id, tag);

CREATE TABLE Release_Links(
    release_id INTEGER,
    url TEXT,
    name TEXT,
    created_at INTEGER,
    updated_at INTEGER,

    FOREIGN KEY(release_id) REFERENCES Releases(id) ON UPDATE CASCADE
)

CREATE UNIQUE INDEX index_release_links_on_release_id_and_name ON Release_Links(release_id, name);
CREATE UNIQUE INDEX index_release_links_on_release_id_and_url ON Release_Links(release_id, url);

CREATE TABLE Repository_Lanaguages(
    project_id INTEGER,
    programming_language_id INTEGER,
    share REAL DEFAULT 0,

    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(programming_language_id) REFERENCES Programming_Langauges(id) ON UPDATE CASCADE
);

CREATE UNIQUE INDEX index_repository_languages_on_project_and_languages_id ON Repository_Lanaguages(project_id, programming_language_id); 

CREATE TABLE Software_Liscense_Policies(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    software_liscense_id INTEGER,
    approcal_status INTEGER DEFAULT 0,
    FOREIGN KEY(software_liscense_id) REFERENCES Software_Licenses(id) ON UPDATE CASCADE,
    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE
);

CREATE UNIQUE INDEX index_software_license_policies_unique_per_project ON Software_Liscense_Policies(project_id, software_liscense_id);
CREATE INDEX index_software_license_policies_on_software_license_id ON Software_Liscense_Policies(software_license_id);

CREATE TABLE Software_Licenses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);

CREATE INDEX index_software_licenses_on_name ON Software_Licenses(name);

CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT DEFAULT "",
    encrypted_password TEXT DEFAULT "",
    created_at INTEGER,
    updated_at INTEGER,
    skype TEXT,
    linkedin TEXT,
    twitter TEXT,
    bio TEXT,
    failed_attempts INTEGER DEFAULT 0,
    locked_at INTEGER,
    username TEXT,
    password_expires_at INTEGER,
    avatar TEXT,
    notification_email TEXT
    website_url TEXT,
    public_email TEXT DEFAULT "",
    first_name TEXT,
    last_name TEXT,
    tag_line TEXT,
    organization TEXT,
    last_activity_on INTEGER,
    location TEXT,
    private_profile INTEGER DEFAULT 0,  --BOOLEAN
    include_private_contributions INTEGER DEFAULT 0, --BOOLEAN
    commit_email TEXT 
  );

CREATE INDEX index_users_on_created_at ON Users(created_at);
CREATE UNIQUE INDEX index_users_on_email ON Users(email);
CREATE INDEX index_users_on_public_email ON Users(public_email) WHERE public_email <> "" ;
CREATE INDEX index_users_on_username ON Users(username);

CREATE TABLE Users_Like_Projects(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    user_id INTEGER,
    created_at INTEGER,
    updated_at INTEGER,

    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(user_id) REFERENCES Users(id) ON UPDATE CASCADE
);

CREATE INDEX index_users_like_projects_on_project_id ON Users_Like_Projects(project_id);
CREATE INDEX index_users_star_projects_on_user_id_and_project_id ON Users_Like_Projects(user_id, project_id);

CREATE TABLE Vulnerability_Feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at INTEGER,
    updated_at INTEGER,
    feedback_type INTEGER,
    category INTEGER,
    project_id INTEGER,
    author_id INTEGER,
    issue_id INTEGER,
    merge_request_id INTEGER,
    comment_author_id INTEGER,
    comment TEXT,
    comment_timestamp INTEGER

    FOREIGN KEY(issue_id) REFERENCES Issues(id) ON UPDATE SET NULL,
    FOREIGN KEY(merge_request_id) REFERENCES Merge_Requests(id) ON UPDATE SET NULL,
    FOREIGN KEY(project_id) REFERENCES Projects(id) ON UPDATE CASCADE,
    FOREIGN KEY(author_id) REFERENCES Users(id) ON UPDATE CASCADE,
    FOREIGN KEY(comment_author_id) REFERENCES Users(id) ON UPDATE SET NULL

)

CREATE INDEX index_vulnerability_feedback_on_author_id ON Vulnerability_Feedback(author_id);
CREATE INDEX index_vulnerability_feedback_on_comment_author_id ON Vulnerability_Feedback(comment_author_id);
CREATE INDEX index_vulnerability_feedback_on_issue_id ON Vulnerability_Feedback(issue_id);
CREATE INDEX index_vulnerability_feedback_on_merge_request_id ON Vulnerability_Feedback(merge_request_id);
CREATE UNIQUE INDEX vulnerability_feedback_unique_idx ON Vulnerability_Feedback(project_id, category, feedback_type) 
