import * as core from "@actions/core";
import * as github from "@actions/github";
import { getConfig } from "./config";
import { isOffHours } from "./schedule";
import { ensureLabel, applyLabel } from "./labeler";
import { buildComment, postComment } from "./commenter";
import { TriggerContext, EventType } from "./types";

async function run(): Promise<void> {
  try {
    const config = getConfig();
    const { context } = github;
    const { eventName, payload } = context;

    core.debug(`Event: ${eventName}`);
    core.debug(`Action: ${payload.action}`);

    if (payload.action !== "opened") {
      core.info(`Skipping action "${payload.action}" — only handles "opened".`);
      return;
    }

    let triggerCtx: TriggerContext;

    if (eventName === "issues" && payload.issue) {
      triggerCtx = {
        type: "issue" as EventType,
        number: payload.issue.number,
        author: payload.issue.user?.login ?? "unknown",
        title: payload.issue.title ?? "",
        existingLabels: (payload.issue.labels ?? []).map(
          (l: { name?: string }) => l.name ?? ""
        ),
      };
    } else if (
      (eventName === "pull_request" || eventName === "pull_request_target") &&
      payload.pull_request
    ) {
      triggerCtx = {
        type: "pull_request" as EventType,
        number: payload.pull_request.number,
        author: payload.pull_request.user?.login ?? "unknown",
        title: payload.pull_request.title ?? "",
        existingLabels: (payload.pull_request.labels ?? []).map(
          (l: { name?: string }) => l.name ?? ""
        ),
      };
    } else {
      core.info(`Event "${eventName}" is not handled by Trunkly. Skipping.`);
      return;
    }

    core.info(
      `Processing ${triggerCtx.type} #${triggerCtx.number} by @${triggerCtx.author}: "${triggerCtx.title}"`
    );

    if (config.skipAuthors.includes(triggerCtx.author.toLowerCase())) {
      core.info(`Skipping: @${triggerCtx.author} is in skip-authors list.`);
      return;
    }

    if (
      config.skipLabel &&
      triggerCtx.existingLabels.includes(config.skipLabel)
    ) {
      core.info(`Skipping: item already has skip-label "${config.skipLabel}".`);
      return;
    }

    if (triggerCtx.existingLabels.includes(config.label)) {
      core.info(`Skipping: item already has label "${config.label}".`);
      return;
    }

    if (!isOffHours(config)) {
      core.info(
        `Not off-hours in timezone "${config.timezone}". No action taken.`
      );
      return;
    }

    core.info(
      `Off-hours detected! Processing ${triggerCtx.type} #${triggerCtx.number}.`
    );
    if (config.dryRun) {
      core.info("DRY RUN MODE — no changes will be made.");
    }

    const octokit = github.getOctokit(config.githubToken);
    const { owner, repo } = context.repo;

    await ensureLabel(octokit, owner, repo, config);
    await applyLabel(octokit, owner, repo, triggerCtx.number, config);

    const commentBody = buildComment(config.comment, {
      author: triggerCtx.author,
      label: config.label,
      start: config.offHoursStart,
      end: config.offHoursEnd,
      timezone: config.timezone,
      type: triggerCtx.type === "issue" ? "issue" : "pull request",
      number: String(triggerCtx.number),
      title: triggerCtx.title,
    });

    await postComment(
      octokit,
      owner,
      repo,
      triggerCtx.number,
      commentBody,
      config.dryRun
    );

    core.info("Trunkly 🐘 done.");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Trunkly failed: ${error.message}`);
    } else {
      core.setFailed("Trunkly failed with an unknown error.");
    }
  }
}

run();