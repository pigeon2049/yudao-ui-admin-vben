import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';

import { describe, expect, it } from 'vitest';

import Tree from '../tree.vue';

describe('tree', () => {
  it('updates bulk selections after the tree data changes', async () => {
    const treeData = ref([
      {
        id: 1,
        name: 'parent',
        children: [
          { id: 2, name: 'child-2' },
          { id: 3, name: 'child-3' },
        ],
      },
    ]);
    const selected = ref<number[]>([]);

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Tree, {
              defaultExpandedKeys: [1],
              labelField: 'name',
              modelValue: selected.value,
              multiple: true,
              'onUpdate:modelValue': (value: number[]) => {
                selected.value = value;
              },
              treeData: treeData.value,
              valueField: 'id',
            });
        },
      }),
    );

    selected.value = [1, 2, 3];
    await nextTick();
    expect(wrapper.findAll('.tree-node[data-selected]')).toHaveLength(3);

    treeData.value[0]!.children.push({ id: 4, name: 'child-4' });
    selected.value = [1, 2, 3, 4];
    await nextTick();
    expect(wrapper.findAll('.tree-node[data-selected]')).toHaveLength(4);
  });

  it('deduplicates descendants when selecting a half-selected parent', async () => {
    const treeData = [
      {
        id: 1,
        name: 'parent',
        children: [
          { id: 2, name: 'child-2' },
          { id: 3, name: 'child-3' },
        ],
      },
    ];
    const selected = ref<number[]>([2]);

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(Tree, {
              defaultExpandedKeys: [1],
              labelField: 'name',
              modelValue: selected.value,
              multiple: true,
              'onUpdate:modelValue': (value: number[]) => {
                selected.value = value;
              },
              treeData,
              valueField: 'id',
            });
        },
      }),
    );

    await nextTick();
    const nodes = wrapper.findAll('.tree-node');
    expect(nodes).toHaveLength(3);

    await nodes[0]!.find('button').trigger('click');
    await nextTick();
    expect(new Set(selected.value)).toEqual(new Set([1, 2, 3]));
    expect(selected.value).toHaveLength(3);
  });
});
