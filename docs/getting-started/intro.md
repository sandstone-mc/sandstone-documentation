---
id: intro
title: Introduction
description: An introduction to Sandstone.
slug: /
sidebar_position: 1
---
import GitHubButton from 'react-github-btn'
import { CodeOutput } from '../../src/components'

Sandstone is a Typescript library for Minecraft Datapacks. It allows easy creation, debug and sharing of Minecraft functions, loot tables, predicates etc...

## Features

### Perfect autocompletion & built-in Wiki

Sandstone tells you what a command expects, and autocomplete complicated arguments for you. It ships with the official Wiki documentation for all commands and resources.

You don't need to remember commands syntax anymore.

![autocomplete](/img/autocompletion/command.gif)

This autocompletion works for commands, predicates, loot tables, advancements...

### Easy to share
Sharing commands has **never been easier**. Just publish your functions on NPM, and everyone can use them to improve their own datapacks.

### Designed for developers
Sandstone is designed with developer experience in mind. The goal is to provide a beautiful library, easy to understand and to use, with enough abstractions to empower Datapack creators. 

Sandstone comes with a built-in Command Line Interface (CLI), named `sand`: it allows you to build your data pack, rebuild on change, without even thinking about it.

Sandstone **does not force its abstractions** on you:
- Most of the time, you can use Sandstone abstractions: they are efficient and configurable, which allows you to quickly develop performant data packs.
- When performance and behavior need to be fine-tuned, you can use all vanilla commands without any of Sandstone abstraction. You will still get autocompletion, build-time and run-time checks, to ensure your data pack runs as expected!

## Supporting Sandstone

If you want to support Sandstone, the simplest way is to star the repository [on Github](https://github.com/themrzz/sandstone)! It's very encouraging.

<!-- This is the star button -->
<GitHubButton href="https://github.com/TheMrZZ/sandstone" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-show-count="true" data-size="large" aria-label="Star TheMrZZ/sandstone on GitHub">Star</GitHubButton>
