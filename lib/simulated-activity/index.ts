/**
 * Modulo attività simulata (bot).
 * Config centrale e, in seguito, funzioni per previsioni, commenti, reazioni, follow.
 */

export {
  BOT_EMAIL_PREFIX,
  BOT_EMAIL_DOMAIN,
  BOT_INITIAL_CREDITS,
  ENABLE_SIMULATED_ACTIVITY,
  MAX_PREDICTIONS_PER_RUN,
  MAX_COMMENTS_PER_RUN,
  MAX_REACTIONS_PER_RUN,
  MAX_FOLLOWS_PER_RUN,
} from "./config";

export {
  getOrCreateBotUsers,
  ensureBotsHaveCredits,
  type BotUser,
} from "./bot-users";

export {
  createSimulatedPrediction,
  runSimulatedPredictions,
  type CreateSimulatedPredictionParams,
  type RunSimulatedPredictionsOptions,
} from "./predictions";

export {
  createSimulatedComment,
  runSimulatedComments,
  type CreateSimulatedCommentParams,
  type RunSimulatedCommentsOptions,
} from "./comments";

export {
  COMMENT_TEMPLATES,
  REPLY_PROBABILITY,
  type CommentTemplate,
} from "./comment-templates";

export {
  createSimulatedReaction,
  runSimulatedReactions,
  REACTION_TYPES,
  type CreateSimulatedReactionParams,
  type RunSimulatedReactionsOptions,
  type ReactionType,
} from "./reactions";

export {
  createSimulatedFollow,
  runSimulatedFollows,
  type CreateSimulatedFollowParams,
  type RunSimulatedFollowsOptions,
} from "./followers";

export {
  runSimulatedActivity,
  type RunSimulatedActivityResult,
} from "./runner";
