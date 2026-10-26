import { BilingualField } from "./BilingualField";
import type { FieldErrors } from "./form";
import { RepeatableList } from "./RepeatableList";

/** Listes de contenu bilingues réutilisées par les voyages et les destinations. */

export type FaqState = {
  questionFr: string;
  questionAr: string;
  answerFr: string;
  answerAr: string;
};
export type SimpleItemState = { textFr: string; textAr: string };
export type LabeledItemState = {
  labelFr: string;
  labelAr: string;
  textFr: string;
  textAr: string;
};

export const newFaq = (): FaqState => ({
  questionFr: "",
  questionAr: "",
  answerFr: "",
  answerAr: "",
});
export const newSimpleItem = (): SimpleItemState => ({ textFr: "", textAr: "" });
export const newLabeledItem = (): LabeledItemState => ({
  labelFr: "",
  labelAr: "",
  textFr: "",
  textAr: "",
});

export function FaqEditor({
  items,
  onChange,
  errors,
  prefix = "faqs",
}: {
  items: FaqState[];
  onChange: (items: FaqState[]) => void;
  errors: FieldErrors;
  prefix?: string | undefined;
}) {
  return (
    <RepeatableList
      items={items}
      onChange={onChange}
      newItem={newFaq}
      itemLabel="Question"
      addLabel="Ajouter une question"
      emptyText="Aucune question pour le moment."
      renderItem={(item, index, update) => (
        <div className="space-y-4">
          <BilingualField
            label="Question"
            valueFr={item.questionFr}
            valueAr={item.questionAr}
            onChangeFr={(v) => update({ questionFr: v })}
            onChangeAr={(v) => update({ questionAr: v })}
            errorFr={errors[`${prefix}.${index}.questionFr`]}
            errorAr={errors[`${prefix}.${index}.questionAr`]}
          />
          <BilingualField
            label="Réponse"
            multiline
            valueFr={item.answerFr}
            valueAr={item.answerAr}
            onChangeFr={(v) => update({ answerFr: v })}
            onChangeAr={(v) => update({ answerAr: v })}
            errorFr={errors[`${prefix}.${index}.answerFr`]}
            errorAr={errors[`${prefix}.${index}.answerAr`]}
          />
        </div>
      )}
    />
  );
}

/** Liste de phrases simples (inclus, non inclus, points forts d'un voyage). */
export function SimpleItemsEditor({
  items,
  onChange,
  errors,
  prefix,
  itemLabel,
  addLabel,
  emptyText,
  placeholder,
}: {
  items: SimpleItemState[];
  onChange: (items: SimpleItemState[]) => void;
  errors: FieldErrors;
  prefix: string;
  itemLabel: string;
  addLabel: string;
  emptyText: string;
  placeholder?: string | undefined;
}) {
  return (
    <RepeatableList
      items={items}
      onChange={onChange}
      newItem={newSimpleItem}
      itemLabel={itemLabel}
      addLabel={addLabel}
      emptyText={emptyText}
      renderItem={(item, index, update) => (
        <BilingualField
          label="Texte"
          valueFr={item.textFr}
          valueAr={item.textAr}
          onChangeFr={(v) => update({ textFr: v })}
          onChangeAr={(v) => update({ textAr: v })}
          errorFr={errors[`${prefix}.${index}.textFr`]}
          errorAr={errors[`${prefix}.${index}.textAr`]}
          placeholderFr={placeholder}
        />
      )}
    />
  );
}

/** Liste « titre + texte » (points forts et infos pratiques d'une destination). */
export function LabeledItemsEditor({
  items,
  onChange,
  errors,
  prefix,
  itemLabel,
  addLabel,
  emptyText,
}: {
  items: LabeledItemState[];
  onChange: (items: LabeledItemState[]) => void;
  errors: FieldErrors;
  prefix: string;
  itemLabel: string;
  addLabel: string;
  emptyText: string;
}) {
  return (
    <RepeatableList
      items={items}
      onChange={onChange}
      newItem={newLabeledItem}
      itemLabel={itemLabel}
      addLabel={addLabel}
      emptyText={emptyText}
      renderItem={(item, index, update) => (
        <div className="space-y-4">
          <BilingualField
            label="Titre"
            optionalFr
            valueFr={item.labelFr}
            valueAr={item.labelAr}
            onChangeFr={(v) => update({ labelFr: v })}
            onChangeAr={(v) => update({ labelAr: v })}
            errorFr={errors[`${prefix}.${index}.labelFr`]}
            errorAr={errors[`${prefix}.${index}.labelAr`]}
          />
          <BilingualField
            label="Texte"
            multiline
            rows={2}
            valueFr={item.textFr}
            valueAr={item.textAr}
            onChangeFr={(v) => update({ textFr: v })}
            onChangeAr={(v) => update({ textAr: v })}
            errorFr={errors[`${prefix}.${index}.textFr`]}
            errorAr={errors[`${prefix}.${index}.textAr`]}
          />
        </div>
      )}
    />
  );
}
