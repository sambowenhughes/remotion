import type {RefObject} from 'react';
import React from 'react';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {renderHook} from './render-hook';

describe('Should update state when volume changes', () => {
	const setState = jest.fn();
	const useStateSpy = jest.spyOn(React, 'useState');
	beforeEach(() => {
		// @ts-expect-error
		useStateSpy.mockImplementation((init) => [init, setState]);
	});
	afterEach(() => {
		useStateSpy.mockRestore();
	});

	test('has the volume been set', () => {
		const addEventListener = jest.fn();
		const removeEventListener = jest.fn();
		let audioRef = {
			current: {volume: 0.5, addEventListener, removeEventListener},
		} as unknown as RefObject<HTMLAudioElement>;

		const {rerender} = renderHook(({mediaRef}) => useMediaTagVolume(mediaRef), {
			initialProps: {mediaRef: audioRef},
		});

		expect(setState).toHaveBeenCalledWith(0.5);
		audioRef = {
			current: {...audioRef.current, volume: 0.75},
		} as RefObject<HTMLAudioElement>;
		rerender({mediaRef: audioRef});
		expect(setState).toHaveBeenCalledWith(0.75);
		expect(addEventListener).toHaveBeenCalledWith(
			'volumechange',
			expect.anything()
		);
		expect(removeEventListener).toHaveBeenCalledWith(
			'volumechange',
			expect.anything()
		);
	});
});

test('Should listen for volume changes', () => {
	const addEventListener = jest.fn();
	const removeEventListener = jest.fn();
	const audioRef = {
		current: {volume: 0.5, addEventListener, removeEventListener},
	} as unknown as RefObject<HTMLAudioElement>;

	renderHook(({mediaRef}) => useMediaTagVolume(mediaRef), {
		initialProps: {mediaRef: audioRef},
	});

	expect(addEventListener).toHaveBeenCalledTimes(1);
});
