/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

/* global sinon */

import DeploymentEventHandler from '../DeploymentEventHandler';

const EXAMPLE_ERROR = 'something went wrong';

const SUCCESS_STATUS = 'success';

describe('<DeploymentEventHandler>', () => {

  let subscribe, onSend;

  beforeEach(() => {

    subscribe = sinon.spy();

    onSend = sinon.spy();

    const deploymentEventHandler = new DeploymentEventHandler({ onSend, subscribe });

    deploymentEventHandler.enable();
  });

  it('should subscribe to deployment.done', () => {
    expect(subscribe.getCall(0).args[0]).to.eql('deployment.done');
  });


  it('should subscribe to deployment.error', () => {
    expect(subscribe.getCall(1).args[0]).to.eql('deployment.error');
  });


  it('should send for type bpmn', async () => {

    // given
    const tab = createTab({
      type: 'bpmn'
    });

    const handleDeploymentDone = subscribe.getCall(0).args[1];

    // when
    await handleDeploymentDone({ tab });

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'deployment',
      deployment: {
        diagramType: 'bpmn',
        diagramMetrics: {},
        outcome: SUCCESS_STATUS
      }
    });
  });


  it('should send for type dmn', async () => {

    // given
    const tab = createTab({
      type: 'dmn'
    });

    const handleDeploymentDone = subscribe.getCall(0).args[1];

    // when
    await handleDeploymentDone({ tab });

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'deployment',
      deployment: {
        diagramType: 'dmn',
        diagramMetrics: {},
        outcome: SUCCESS_STATUS
      }
    });
  });


  it('should NOT send for type cmmn', async () => {

    // given
    const tab = createTab({
      type: 'cmmn'
    });

    const handleDeploymentDone = subscribe.getCall(0).args[1];

    // when
    await handleDeploymentDone({ tab });

    // then
    expect(onSend).to.not.have.been.called;
  });


  it('should send deployment error', async () => {

    // given
    const tab = createTab({
      type: 'bpmn'
    });

    const error = {
      code: EXAMPLE_ERROR
    };

    const handleDeploymentError = subscribe.getCall(1).args[1];

    // when
    await handleDeploymentError({ tab, error });

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'deployment',
      deployment: {
        diagramType: 'bpmn',
        diagramMetrics: {},
        outcome: EXAMPLE_ERROR
      }
    });
  });


  it('should send on run', async () => {

    // given
    const tab = createTab({
      type: 'bpmn'
    });

    const handleDeploymentError = subscribe.getCall(1).args[1];

    // when
    await handleDeploymentError({ tab, isRun: true });

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'deployment',
      deployment: {
        diagramType: 'bpmn',
        diagramMetrics: {},
        isRun: true,
        outcome: SUCCESS_STATUS
      }
    });
  });

});


// helpers ///////////////

function createTab(overrides = {}) {
  return {
    id: 42,
    name: 'foo.bar',
    type: 'bar',
    title: 'foo',
    file: {
      name: 'foo.bar',
      contents: '',
      path: null
    },
    ...overrides
  };
}