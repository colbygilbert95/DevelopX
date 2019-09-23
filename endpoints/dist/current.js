import React, { Component } from "react";
import {
  fetchRepoDetailsByRepoName,
  fetchBountyDetailsByRepoName
} from "../../store/actions/repoActions";
import {
  fetchProjectDirectory,
  repositoryExists,
  fetchFileContents,
  fetchLastCommit,
  fetchTotalCommits
} from "../../store/actions/gitActions";
import { Redirect, Link } from "react-router-dom";
import { connect } from "react-redux";
import ProjectDirectory from "./projectDirectory/ProjectDirectory";
// import CreateBounty from "../bounty/CreateBounty";
// import BountyList from "../bounty/BountyList";
import CopyToClipboard from "react-copy-to-clipboard";
import Navbar2 from "../layout/Navbar2";
import ReactTooltip from "react-tooltip";
import NewProject from "./projectDirectory/NewProject";
import FileContents from "./FileContents";
import TimeAgo from "react-timeago";

class RepoDetails extends Component {
  state = {
    repoName: "",
    value: "",
    copied: false,
    filepage: false
  };

  componentDidMount() {
    const params = window.location.href.split(/[\/&]/);
    // console.log(params[5]);

    this.setState({ repoName: params[5] });

    this.props.fetchRepoDetailsByRepoName(params[5]);

    
    this.props.fetchLastCommit({
      proj_manager: params[4],
      project_name: params[5],
      file_path: "/"
    });
    this.props.fetchTotalCommits({
      proj_manager: params[4],
      project_name: params[5]
    });
    
    this.props.repositoryExists({ proj_manager: params[4], project_name: params[5] });
    if(params.length > 6 && params[params.length - 2].includes(".")) {
      this.setState({filepage:true});
      this.props.fetchFileContents({
        proj_manager: params[4],
        project_name: params[5],
        blob: params[params.length -1]
      });
    } else {
      this.setState({filepage:false});
      this.props.fetchProjectDirectory({
        proj_manager: params[4],
        project_name: params[5],
        directory: (params.length > 6 ? params[params.length -1] : "HEAD")
      });
    }
    
  //  this.state.params = params;
  }

  componentDidUpdate(prevProps) {
    
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.state.params = window.location.href.split(/[\/&]/);
      const { params } = this.state;
      if(params.length > 6 && params[params.length - 2].includes(".")) {
        this.setState({filepage:true});
        this.props.fetchFileContents({
          proj_manager: params[4],
          project_name: params[5],
          blob: params[params.length -1]
        });
      } else {
        this.setState({filepage:false});
        this.props.fetchProjectDirectory({
          proj_manager: params[4],
          project_name: params[5],
          directory: (params.length > 6 ? params[params.length -1] : "HEAD")
        });
      }
    } 
  }
  constructPath() {
  
    const params = window.location.href.split(/[\/&]/);
    let path = "/";
    for (let i = 6; i < params.length - 1; i++) {
      path += params[i] + "/";
    }
    
    return path;
  }

  onCopy = e => {
    this.setState({ copied: true });
  };

  addRepoNameonclickToggle = e => {
    const { account_name } = this.props;
    this.createbounty.addRepoNameonclickToggle(this.state.repoName, e); // do stuff
  };

  render() {
    const {
      reponame_values,
      reponame_bounty_values,
      auth,
      directory,
      repo_exists,
      total_commits,
      last_commit,
      blob
    } = this.props;

    if (!auth.uid) return <Redirect to="/" />;

    if (reponame_values) {
      console.log("last commit", last_commit)
      return (
        <div>
          <Navbar2 type={"sm"}/>
          {/* <div className="container">
            <div className="txtalign__center"><h2>Repos</h2>  </div>
          </div> */}

          <div className="container section c_repodetails">
            <div className="card z-depth-0">
              <div className="card-content">
                <div className="row flex-row-reverse">
                  <div className="col-sm-12 col-md-3 float-right txtalign__center">
                    {/* <p className="a_repototal">
                      <img
                        src={require("../../img/a_icon__dollar.png")}
                        srcSet={require("../../img/a_icon__dollar@2x.svg")}
                        alt="NouGit Logo"
                        className="maxwidth__eos"
                      />{" "}
                      <span className="a_eostotal">
                        {reponame_values.total_eos}
                      </span>
                    </p> */}

                    {/* <button
                      className="btn btn-outline-warning margin__2"
                      onClick={this.addRepoNameonclickToggle}
                    >
                      Create A Job
                    </button> */}
                    {/* <CreateBounty onRef={ref => (this.createbounty = ref)} /> */}
                    {/* <button className="btn btn-outline-warning margin__2"   data-clipboard-text="">Clone</button> */}
                    {/* {textToBecloned="http://35.204.160.204:7005/"&reponame_values.proj_manager&"/"&reponame_values.project_name} */}
                  </div>

                  <div className="col-sm-12 col-md-9 float-left">
                    <h5 className="card-title a_reponame">
                      {reponame_values.project_name}
                    </h5>

                    <span className=" a_repomanager">
                    Owned by <Link to={"/user/" + reponame_values.proj_manager}>{reponame_values.proj_manager}</Link>
                    </span>

                    <span>
                      Total Commits:{" "}
                      {repo_exists ? total_commits.totalCommits : 0}
                    </span>
                    <div className="col-sm-12 col-md-5 float-right txtalign__right btn_clone">
                      {this.state.copied ? (
                        <ReactTooltip
                          place="top"
                          effect="solid"
                          type="success"
                        />
                      ) : (
                        <ReactTooltip place="top" effect="solid" type="info" />
                      )}
                      <CopyToClipboard
                        text={
                          "http://35.233.1.200:7005/" +
                          reponame_values.proj_manager +
                          "/" +
                          reponame_values.project_name +
                          ".git"
                        }
                        onCopy={this.onCopy}
                      >
                        <button
                          className="btn btn__smblue margin__2"
                          data-tip={
                            this.state.copied
                              ? "Copied HTTP remote to clipboard ✅"
                              : "Click to copy HTTP remote"
                          }
                        >
                          Clone
                        </button>
                      </CopyToClipboard>
                    </div>

                    {/* <p className="card-text a_repocode">Description - { reponame_values }</p> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="clearfix" />
            <div className="col-sm-12 col-md-7"> </div>

            <div className="col-sm-12">
              <br />
              {/* <h4>Create a new project repository on the command line</h4> */}
              <h4>Project Directory</h4>
                          <h7>{reponame_values.project_name + this.constructPath()}</h7>
              {(this.state.filepage) ? <FileContents contents={blob} /> : (repo_exists ? (
                <div>
                  <div>
                    <span>Author: {last_commit.author_name}</span>
                    <span>
                      Message:{" "}
                      {last_commit.message.substr(
                        0,
                        last_commit.message.length - 17
                      )}
                    </span>
                    <span>Date: <TimeAgo date={last_commit.date}/></span>
                    <span>Last Commit: {last_commit.hash.substr(0, 6)}</span>
                  </div>

                  <ProjectDirectory
                    directory={directory}
                    path={this.constructPath()}
                    project_name={reponame_values.project_name}
                    proj_manager={reponame_values.proj_manager}
                  />
                </div>
              ) : (
                <NewProject
                  proj_manager={reponame_values.proj_manager}
                  project_name={reponame_values.project_name}
                />
              ))}
              {/* {reponame_bounty_values ? (
                reponame_bounty_values.bounties ? (
                  <div className="container c_feed__listview">
                    <div className="do-not-show">
                      {
                        (reponame_bounty_values.bounties.repoMgrName =
                          reponame_values.proj_manager)
                      }
                      {
                        (reponame_bounty_values.bounties.repoId =
                          reponame_values.repoid)
                      }
                    </div>
                    <div className="row">
                      <div className="col-sm-12">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                          <li className="nav-item">
                            <a
                              className="nav-link active"
                              id="bounty-tab"
                              data-toggle="tab"
                              href="#bounty"
                              role="tab"
                              aria-controls="bounty"
                              aria-selected="false"
                            >
                              Jobs
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="col-md-9 float-left">
                      <div className="tab-content" id="myTabContent">
                        <div
                          className="tab-pane fade show active"
                          id="bounty"
                          role="tabpanel"
                          aria-labelledby="bounty-tab"
                        >
                          <BountyList
                            bounties={reponame_bounty_values.bounties}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 float-left">
                      <img
                        src={require("../../img/side_bar.jpg")}
                        srcSet={require("../../img/side_bar@2x.jpg")}
                        alt="Active Users"
                        className="maxwidth__sidebar"
                      />
                    </div>
                  </div>
                ) : null
              ) : null} */}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <Navbar2 />
        </div>
      );
    }
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    auth: state.firebase.auth,
    account_name: state.firebase.profile.account_name,
    reponame_values: state.repo.reponame_values,
    // reponame_bounty_values: state.repo.reponame_bounty_values,
    directory: state.git.directory,
    repo_exists: state.git.repo_exists,
    blob: state.git.blob,
    total_commits: state.git.total_commits,
    last_commit: state.git.last_commit
  };
};

export default connect(
  mapStateToProps,
  {
    fetchRepoDetailsByRepoName,
    fetchBountyDetailsByRepoName,
    fetchProjectDirectory,
    fetchLastCommit,
    fetchTotalCommits,
    repositoryExists,
    fetchFileContents
  }
)(RepoDetails);
