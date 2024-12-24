import { useQueryState } from "nuqs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { mapArrayToString, mapString } from "@/utils/messages";
import { Label } from "./ui/label";

export const Options = () => {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<number>(1);

  const [options, setOptions] = useQueryState("options");

  const [optionArray, setOptionArray] = useState<
    { name: string; count: number }[]
  >(mapString(options));

  useEffect(() => {
    const urlOptions = mapString(options);

    if (urlOptions === optionArray) {
      return;
    }

    if (!optionArray.length) {
      return;
    }

    setOptions(mapArrayToString(optionArray));
  }, [optionArray]);

  const addItem = (name: string, count: number) => {
    setName("");
    setAmount(1);
    setOptionArray((prev) => [...prev, { name, count }]);
  };

  const removeItem = (name: string) => {
    setOptionArray((prev) => prev.filter((o) => o.name !== name));
  };

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-end">
          <div className="flex gap-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Option</Label>
              <Input
                id="name"
                value={name}
                onChange={(v) => setName(v.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="amount">Odds Size</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(v) => {
                  const amountNumber = Number(v.target.value);
                  if (isNaN(amountNumber)) return 1;
                  setAmount(amountNumber);
                }}
              />
            </div>
          </div>
          <Button size={"icon"} onClick={() => addItem(name, amount)}>
            <Plus />
          </Button>
        </div>

        {optionArray.map((o, i) => (
          <div key={o.name + o.count + i} className="flex gap-2 items-end">
            <div className="flex gap-2">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input id={`name${o.name}`} defaultValue={o.name} readOnly />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  id={`amount${o.count}`}
                  defaultValue={o.count}
                  readOnly
                />
              </div>
            </div>

            <Button
              variant={"secondary"}
              size={"icon"}
              onClick={() => removeItem(o.name)}
            >
              <Minus />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
