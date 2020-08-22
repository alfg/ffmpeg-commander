import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import Command from '@/components/Command.vue';
import CommandFragment from '@/components/CommandFragment.vue';

const localVue = createLocalVue();

localVue.use(BootstrapVue);

describe('Command.vue', () => {
  const cmd = '"ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4"';
  const wrapper = shallowMount(Command, {
    propsData: { cmd },
    localVue,
  });

  it('is a Vue instance', () => {
    expect(wrapper.exists()).toBeTruthy();
  });

  it('renders ffmpeg commands to spans', () => {
    const commandFragments = wrapper.findAllComponents(CommandFragment);
    expect(commandFragments.length).toBe(8);
    expect(commandFragments.at(0).props('value')).toBe('"ffmpeg');
  });
});
