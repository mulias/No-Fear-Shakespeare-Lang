import { act, scene } from "./wordlists/act_and_scene";
import {
  arithmetic_operators,
  arithmetic_operators_map,
} from "./wordlists/arithmetic_operators";
import { articles } from "./wordlists/articles";
import { be, be_first_person, be_second_person } from "./wordlists/be";
import {
  is,
  be_comparatives,
  be_comparatives_first_person,
  be_comparatives_second_person,
} from "./wordlists/comparative_question";
import { characters } from "./wordlists/characters";
import { enter, exit, exeunt } from "./wordlists/enter_exit_exeunt";
import { first_person } from "./wordlists/first_person";
import { first_person_possessive } from "./wordlists/first_person_possessive";
import { first_person_reflexive } from "./wordlists/first_person_reflexive";
import { imperatives, to, proceed } from "./wordlists/imperatives";
import { as, not, than, if_so, if_not, and } from "./wordlists/misc";
import {
  negative_adjectives,
  neutral_adjectives,
  positive_adjectives,
  adjectiveDatabase,
  sortAdjectivesByCategory,
} from "./wordlists/adjectives";
import { negative_comparatives } from "./wordlists/negative_comparatives";
import {
  negative_nouns,
  neutral_nouns,
  positive_nouns,
} from "./wordlists/nouns";
import { nothing } from "./wordlists/nothing";
import { positive_comparatives } from "./wordlists/positive_comparatives";
import { roman_numerals } from "./wordlists/roman_numerals";
import { second_person } from "./wordlists/second_person";
import { second_person_possessive } from "./wordlists/second_person_possessive";
import { second_person_reflexive } from "./wordlists/second_person_reflexive";
import { remember, recall } from "./wordlists/stacks";
import { third_person_possessive } from "./wordlists/third_person_possessive";
import { unary_operators } from "./wordlists/unary_operators";
import { you } from "./wordlists/you";
import {
  first_person_pronouns,
  second_person_pronouns,
} from "./wordlists/pronouns";
import {
  input_integer,
  input_char,
  output_integer,
  output_char,
} from "./wordlists/input_output";

/**
 * Horatio Wordlists
 * Holds syntax for parsing. Loaded from includes/wordlists/ at make
 * @memberof Horatio
 * @namespace
 */
export default {
  act: act,
  scene: scene,
  arithmetic_operators: arithmetic_operators,
  arithmetic_operators_map: arithmetic_operators_map,
  articles: articles,
  be: be,
  be_first_person: be_first_person,
  be_second_person: be_second_person,
  is: is,
  be_comparatives: be_comparatives,
  be_comparatives_first_person: be_comparatives_first_person,
  be_comparatives_second_person: be_comparatives_second_person,
  characters: characters,
  enter: enter,
  exit: exit,
  exeunt: exeunt,
  first_person: first_person,
  first_person_possessive: first_person_possessive,
  first_person_reflexive: first_person_reflexive,
  imperatives: imperatives,
  to: to,
  proceed: proceed,
  input_integer: input_integer,
  input_char: input_char,
  output_integer: output_integer,
  output_char: output_char,
  as: as,
  not: not,
  than: than,
  if_so: if_so,
  if_not: if_not,
  and: and,
  negative_adjectives: negative_adjectives,
  negative_comparatives: negative_comparatives,
  negative_nouns: negative_nouns,
  neutral_adjectives: neutral_adjectives,
  neutral_nouns: neutral_nouns,
  nothing: nothing,
  positive_adjectives: positive_adjectives,
  positive_comparatives: positive_comparatives,
  positive_nouns: positive_nouns,
  first_person_pronouns: first_person_pronouns,
  second_person_pronouns: second_person_pronouns,
  roman_numerals: roman_numerals,
  second_person: second_person,
  second_person_possessive: second_person_possessive,
  second_person_reflexive: second_person_reflexive,
  remember: remember,
  recall: recall,
  third_person_possessive: third_person_possessive,
  unary_operators: unary_operators,
  you: you,
  adjectiveDatabase: adjectiveDatabase,
  sortAdjectivesByCategory: sortAdjectivesByCategory,
};
