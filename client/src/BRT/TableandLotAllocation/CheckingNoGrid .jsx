import { Check } from "lucide-react"; // optional icon library

const CheckingNoGrid = ({
  data,
  selectedTables,
  setSelectedTables,
  handleSelect,
}) => {
  console.log(data, "receivedData");
  console.log(selectedTables, "selectedTables");

  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",

    "bg-lime-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-rose-500",
    "bg-amber-500",
  ];

  const sortedData = [...(data || [])]?.sort(
    (a, b) => Number(a.CHECKINGNO) - Number(b.CHECKINGNO),
  );
  console.log(sortedData, "sortedData");

  //   return (
  //     <div className="p-2">
  //       <div
  //         className="
  //         grid
  //         grid-cols-5
  //         sm:grid-cols-6
  //         md:grid-cols-8
  //         lg:grid-cols-10
  //         xl:grid-cols-12
  //         gap-2 text-lg
  //       "
  //       >
  //         {sortedData?.map((item, index) => (
  //           <div
  //             key={item?.GTCHKTABLEMASTID}
  //             className={`
  //               ${colors[index % colors.length]}
  // aspect-video              flex
  //               items-center
  //               justify-center
  //               text-white
  //               font-semibold
  //               text-lg
  //               md:text-base
  //               rounded-lg
  //               shadow
  //               hover:scale-105
  //               transition
  //             `}
  //           >
  //             <span className="text-lg">{item?.CHECKINGNO}</span>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  return (
    <div className="p-2">
      <div
        className="
        grid
        grid-cols-5
        sm:grid-cols-6
        md:grid-cols-8
        lg:grid-cols-10
        xl:grid-cols-12
        gap-2
      "
      >
        {sortedData.map((item, index) => {
          const isSelected = selectedTables.some(
            (t) => t.GTCHKTABLEMASTID === item.GTCHKTABLEMASTID,
          );

          return (
            <div
              key={item.GTCHKTABLEMASTID}
              onClick={() => handleSelect(item)}
              className={`
        relative
        cursor-pointer
        aspect-video
        flex items-center justify-center
        text-white font-semibold
        rounded-lg shadow
        transition
        ${colors[index % colors.length]}
      `}
            >
              <span className="text-lg z-10">{item.CHECKINGNO}</span>

              {isSelected && (
                <div
                  className="
          absolute inset-0
          bg-white/40 text-white font-semibold
          rounded-lg
          z-20
        "
                />
              )}

              {isSelected && (
                <div
                  className="
          absolute top-1 right-1
          bg-white rounded-full
          p-0.5 z-30
        "
                >
                  <Check size={18} className="text-green-600" />
                </div>
              )}
            </div>
          );
        })}
        
      </div>

      {/* Selected Tables Display */}
    </div>
  );
};

export default CheckingNoGrid;
