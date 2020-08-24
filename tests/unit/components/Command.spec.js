import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import Command from '@/components/Command.vue';
import CommandFragment from '@/components/CommandFragment.vue';

const localVue = createLocalVue();

localVue.use(BootstrapVue);

describe('Command.vue', () => {
  const cmd = 'ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4';
  const wrapper = shallowMount(Command, {
    propsData: { cmd },
    localVue,
  });

  it('is a Vue instance', () => {
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should pass the correct props', () => {
    const props = wrapper.props();
    expect(props.cmd).toBe(cmd);
  });

  it('renders ffmpeg string to command fragments', () => {
    const commandFragments = wrapper.findAllComponents(CommandFragment);
    expect(commandFragments.length).toBe(8);
    expect(commandFragments.at(0).props('value')).toBe('ffmpeg');
    expect(commandFragments.at(1).props('value')).toBe('-i');
    expect(commandFragments.at(2).props('value')).toBe('input.mp4');
    expect(commandFragments.at(3).props('value')).toBe('-c:v');
    expect(commandFragments.at(4).props('value')).toBe('libx264');
    expect(commandFragments.at(5).props('value')).toBe('-c:a');
    expect(commandFragments.at(6).props('value')).toBe('copy');
    expect(commandFragments.at(7).props('value')).toBe('output.mp4');
  });

  it('renders ffmpeg popover tips', () => {
    const popovers = wrapper.findAll('.tips');
    expect(popovers.length).toBe(8);
    expect(popovers.at(0).text()).toBe('Command used to run FFmpeg.');
    expect(popovers.at(7).text()).toBe('');
  });

  it('gets tooltips', () => {
    const command = 'ffmpeg -i';
    const tooltips = wrapper.vm.getToolTips(command);
    const expectedResult = [
      { value: 'ffmpeg', description: 'Command used to run FFmpeg.' },
      { value: '-i', description: 'Input file.' },
    ];
    expect(tooltips).toEqual(expectedResult);
  });
});
