import {Definition} from '../lib/types';
import * as reporting from '../lib/reporting';
import extend from '../lib/extend';
import * as exposes from '../lib/exposes';
const e = exposes.presets;
import fz from '../converters/fromZigbee';
import {light} from '../lib/modernExtend';

const definitions: Definition[] = [
    {
        zigbeeModel: ['ZG_LED_DRIVER42CC'],
        model: 'ZG_LED_DRIVER42CC',
        vendor: 'Envilar',
        description: 'Zigbee LED driver',
        extend: [light()],
    },
    {
        zigbeeModel: ['ZG50CC-CCT-DRIVER', 'HK-CCT'],
        model: 'ZG50CC-CCT-DRIVER',
        vendor: 'Envilar',
        description: 'Zigbee CCT LED driver',
        extend: [light({colorTemp: {range: [160, 450]}})],
    },
    {
        zigbeeModel: ['ZGR904-S'],
        model: 'ZGR904-S',
        vendor: 'Envilar',
        description: 'Touchlink remote',
        meta: {battery: {dontDividePercentage: true}},
        fromZigbee: [fz.command_recall, fz.command_on, fz.command_off, fz.command_move, fz.command_stop, fz.battery],
        toZigbee: [],
        exposes: [e.battery(),
            e.action(['recall_1', 'recall_2', 'on', 'off', 'brightness_stop', 'brightness_move_up', 'brightness_move_down'])],
    },
    {
        zigbeeModel: ['ZG102-BOX-UNIDIM'],
        model: 'ZG102-BOX-UNIDIM',
        vendor: 'Envilar',
        description: 'ZigBee AC phase-cut dimmer',
        extend: extend.light_onoff_brightness({noConfigure: true}),
        configure: async (device, coordinatorEndpoint, logger) => {
            await extend.light_onoff_brightness().configure(device, coordinatorEndpoint, logger);
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
            await reporting.onOff(endpoint);
        },
    },
    {
        zigbeeModel: ['ZG302-BOX-RELAY'],
        model: 'ZG302-BOX-RELAY',
        vendor: 'Envilar',
        description: 'Zigbee AC in wall switch',
        extend: extend.switch(),
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic', 'genIdentify', 'genOnOff']);
        },
    },
    {
        zigbeeModel: ['2CH-ZG-BOX-RELAY'],
        model: '2CH-ZG-BOX-RELAY',
        vendor: 'Envilar',
        description: '2 channel box relay',
        extend: extend.switch(),
        exposes: [e.switch().withEndpoint('l1'), e.switch().withEndpoint('l2')],
        endpoint: (device) => {
            return {'l1': 1, 'l2': 2};
        },
        meta: {multiEndpoint: true},
        configure: async (device, coordinatorEndpoint, logger) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
        },
    },
];

export default definitions;
module.exports = definitions;
