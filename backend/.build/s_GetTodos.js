
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'zxa011023',
  applicationName: 'serverless-todo-app',
  appUid: 'ZbDqtyxhTq5jsWjhFx',
  orgUid: '5d26c73c-a9c6-4994-9a26-084be70cd6db',
  deploymentUid: '6a360cff-823b-4b7a-a0b0-bcf9d425e85b',
  serviceName: 'serverless-todo-app',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'dev',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '4.5.2',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'serverless-todo-app-dev-GetTodos', timeout: 6 };

try {
  const userHandler = require('./src/lambda/http/getTodos.js');
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}