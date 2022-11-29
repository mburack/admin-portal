import { useEffect, useRef, useState } from "react";
import { ProcessedDropoffLocation } from "../types";
import { useMutation } from "react-query";
import chevron_up from "../assets/chevron-up.svg";
import chevron_down from "../assets/chevron-down.svg";
import * as Checkbox from "@radix-ui/react-checkbox";

const key = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID_DEV = "app18BBTcWqsoNjb2";


//Taken from y-knot code base. Used to track click event outside of the dropdown.
const useClickOutside = (onClickOutside: () => void) => {
  const domNodeRef = useRef<any>(null);

  const clickedOutsideDomNodes = (e: any) => {
    return !domNodeRef.current || !domNodeRef.current.contains(e.target);
  };
  //Because I gave up on trying to get the types to work.
  const handleClick = (e: any) => {
    e.preventDefault();
    if (clickedOutsideDomNodes(e)) {
      onClickOutside();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return [domNodeRef];
};

interface FilterItemProps {
  onSelect: () => void;
  filterLabel: string;
  selected: boolean;
}
const FilterItem: React.FC<FilterItemProps> = (props: FilterItemProps) => {
  const { filterLabel, selected, onSelect } = props;
  return (
    <li
      className={`flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-newLeafGreen px-2 text-left font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
        selected ? "bg-newLeafGreen text-white" : "bg-white text-newLeafGreen"
      }`}
      onClick={onSelect}
    >
      <div className="w-10/12">
      {filterLabel}
      </div>  
      <Checkbox.Root
          className={`flex h-4 w-4 ml-auto items-end justify-end rounded border border-newLeafGreen hover:brightness-110 ${
            selected ? "bg-white" : "bg-softGrayWhite"
          }`}
          checked={selected}
          id="c1"
        >
          <Checkbox.Indicator className="CheckboxIndicator">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="black"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </Checkbox.Indicator>
        </Checkbox.Root>
    </li>
  );
};

interface Props {
  filters: { label: string; }[];
  locations: ProcessedDropoffLocation[];
  driverId: string;    
}

export const Dropdown: React.FC<Props> = ({ filters, locations, driverId }) => {
  const [selectedFilters, setSelectedFilters] = useState(
    Array(filters.length).fill(false)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filtered, setFiltered] = useState(locations);
  const [dropdownRef] = useClickOutside(() => setIsDropdownOpen(false));

  useEffect(() => {
    let filteredItems = locations;
    setFiltered(filteredItems);
  }, selectedFilters);

  const onFilterSelect = (i: number) => {
    let newSelectedFilters = [...selectedFilters];
    newSelectedFilters[i] = !selectedFilters[i];
    setSelectedFilters(newSelectedFilters);
    let ids : string[] = [];
    newSelectedFilters.forEach( (item, idx) => {
        if (newSelectedFilters[idx] == true) {ids.push(locations[idx].id)} 
    } )
    assignLocation.mutate(ids);
  };

  const assignLocation = useMutation({
    mutationFn: async (ids: string[]) => {
      const data = {
        records: [
          {
            id: driverId,
            fields: { "📍 Drop off location" : ids },
          },
        ],
      };
      const json = JSON.stringify(data);
      const resp = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID_DEV}/%F0%9F%93%85%20Scheduled%20Slots`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: json,
        }
      );
      return resp.json();
    },
  });

  return (
    <div className="flex h-9 items-start gap-8">
      <div
        className= {`flex flex-col items-start ${
            isDropdownOpen ? "z-50" : "z-0"
            }`}
        ref={dropdownRef}
      >
      {/* Dropdown */}
      <div className="relative">
        <h1
          className={
            "relative flex w-52 select-none items-center justify-between rounded-lg border bg-newLeafGreen px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110" +
            (isDropdownOpen ? " brightness-110 z-50" : "z-0")
          }
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Assign 
          <img 
          className="w-2 md:w-3"
          src={isDropdownOpen ? chevron_up : chevron_down} 
          alt="chevron-icon" />
        </h1>
        {
          <ul className={`absolute flex flex-col gap-2 rounded-lg border bg-white shadow-md  ${
            isDropdownOpen ? "hide-scroll py-2 px-2 z-50 h-36 overflow-y-scroll" : "z-0"
            }`}>
            {isDropdownOpen &&
              filters.map((item, i) => (
                <FilterItem
                  key={i}
                  selected={selectedFilters[i]}
                  onSelect={() => onFilterSelect(i)}
                  filterLabel={item.label}
                />
              ))}
          </ul>
        }
      </div>
      </div>
    </div>
  );
};