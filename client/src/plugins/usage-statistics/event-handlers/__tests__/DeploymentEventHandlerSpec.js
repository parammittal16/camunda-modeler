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

import diagramXML from './fixtures/process-variables.bpmn';

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
        diagramMetrics: { processVariablesCount: 0 },
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
        diagramMetrics: { processVariablesCount: 0 },
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
        diagramMetrics: { processVariablesCount: 0 },
        isRun: true,
        outcome: SUCCESS_STATUS
      }
    });
  });


  describe('diagram metrics', () => {

    it('should send process variables count', async () => {

      // given
      const tab = createTab({
        type: 'bpmn',
        file: {
          contents: diagramXML
        }
      });

      const handleDeploymentError = subscribe.getCall(1).args[1];

      // when
      await handleDeploymentError({ tab });

      // then
      expect(onSend).to.have.been.calledWith({
        event: 'deployment',
        deployment: {
          diagramType: 'bpmn',
          diagramMetrics: {
            processVariablesCount: 3
          },
          outcome: SUCCESS_STATUS
        }
      });
    });


    it('should NOT send process variables count for dmn files', async () => {

      // given
      const tab = createTab({
        type: 'dmn'
      });

      const handleDeploymentError = subscribe.getCall(1).args[1];

      // when
      await handleDeploymentError({ tab });

      // then
      expect(onSend).to.have.been.calledWith({
        event: 'deployment',
        deployment: {
          diagramType: 'dmn',
          diagramMetrics: { },
          outcome: SUCCESS_STATUS
        }
      });
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