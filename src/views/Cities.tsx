import axios from "axios";
import React, { useEffect, useState } from "react";
import { geonameUserId, weatherAppId } from "../utils/ids";
import { Link } from "react-router-dom";
import { error } from "console";

interface coordinatesData {
  lon: number;
  lat: number;
}

interface CityData {
  name: string;
  cou_name_en: string;
  timezone: string;
  geoname_id: string;
  coordinates: coordinatesData;
}

interface SearchCity {
  fcl: string;
  toponymName: string;
  adminName1: string;
  name: string;
}

interface SortBy {
  curr: string;
  isAsc: boolean;
}

interface GetCityProps {
  filterArray?: string[];
  isSort?: boolean;
}

const Cities = () => {
  const [count, setCount] = useState<number>(0);
  const [allCities, setAllCities] = useState<CityData[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dataList, setDataList] = useState<string[]>([]);

  const [sortBy, setSortBy] = useState<SortBy>({
    curr: "name",
    isAsc: true,
  });

  function getWeather(params: coordinatesData): string {
    let weather = ``;
    // try {
    const url = `http://api.openweathermap.org/data/2.5/weather?lon=${params.lon}&lat=${params.lat}&appid=${weatherAppId}`;

    axios
      .get(url)
      .then((data: any) => {
        console.log(data);
      })
      .catch((error: any) => {
        console.log(error);
      });
    // const {name, lon, lat, geonameid} = JSON.parse(params.details)
    // } catch (error) {
    //   console.log(error);
    // }
    return weather;
  }

  function handleSort(curr: string) {
    if (sortBy.curr === curr) {
      setSortBy((prev) => {
        return { ...prev, isAsc: !prev.isAsc };
      });
    } else {
      setSortBy((prev) => {
        return { ...prev, curr, isAsc: true };
      });
    }
  }

  function handleInfiniteScroll() {
    try {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >
        document.documentElement.scrollHeight
      ) {
        setCount((prev) => prev + 20);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getCities({ filterArray, isSort }: GetCityProps) {
    try {
      setIsLoading(true);

      if (filterArray || isSort) setAllCities([]);

      let refineStr: string = "";
      let sortStr: string = `${sortBy.isAsc ? "" : "-"}${
        sortBy.curr || "name"
      }`;

      if (filterArray) {
        refineStr = filterArray
          .map(($: string) => {
            return `&refine=name%3A%22${$}%22`;
          })
          .join("");
      }

      console.log({ refineStr, filterArray });

      const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=50&offset=${
        filterArray || isSort ? "0" : count
      }&order_by=${sortStr}${refineStr}`;

      const data = await axios.get(url);

      if (filterArray || isSort) {
        setAllCities([...data.data.results]);
        setCount(0);
      } else {
        setAllCities([...allCities, ...data.data.results]);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setCount(0);
      const data = await axios.get(
        `http://api.geonames.org/searchJSON?name_startsWith="${event.target.value}"%22%22&username=${geonameUserId}`
      );

      const value = event.target.value.toLocaleLowerCase();

      const newArr: string[] = [];

      if (value !== "") {
        data.data.geonames
          .filter(
            ($: SearchCity) =>
              $.fcl === "P" &&
              $.toponymName === $.name &&
              // $.adminName1.toLocaleLowerCase().includes(value) &&
              $.name.toLocaleLowerCase().startsWith(value)
          )
          .forEach(($: SearchCity) => {
            if (!newArr.includes($.name)) {
              newArr.push($.name);
            }
          });

        setDataList([...newArr]);
        getCities({ filterArray: [...newArr] });
      } else {
        setDataList([]);
        getCities({ isSort: false });
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getCities({ isSort: false });
  }, [count]);

  useEffect(() => {
    getCities({ isSort: true });
  }, [sortBy]);

  useEffect(() => {
    getCities({ isSort: false });

    document.addEventListener("scroll", handleInfiniteScroll);

    return () => document.removeEventListener("scroll", handleInfiniteScroll);
  }, []);
  return (
    <div className="relative">
      <div className="fixed w-screen h-screen bg-[url('https://img.freepik.com/free-photo/empty-street-dark-atmosphere_23-2150914402.jpg?t=st=1713146164~exp=1713149764~hmac=c18a4b9999949d22e615fcc310504bcbe2e6ff753a65e69f75328db28a71047b')] bg-cover z-0"></div>
      <div className={`relative z-10`}>
        {false && (
          <div className="flex justify-end items-center">
            <input list="cities_list" type="text" onChange={handleChange} />
            {dataList && dataList.length > 0 && (
              <datalist id="cities_list">
                {dataList.map(($: string) => {
                  return <option value={$} />;
                })}
              </datalist>
            )}
          </div>
        )}
        {/* {false && allCities && allCities.length > 0 ? (
          <div className="p-5">
            <table className={`w-[100vw]`}>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Country</th>
                  <th>Timezone</th>
                </tr>
              </thead>

              <tbody>
                {allCities.map((city, i) => {
                  return (
                    <tr key={i} className="block mb-2">
                      <td className={`p-3 bg-[rgba(225,225,225,0.25)]`}>
                        <Link
                          to={`/weather/${JSON.stringify({
                            name: city.name,
                            geonameId: city.geoname_id,
                            lon: city.coordinates.lon,
                            lat: city.coordinates.lat,
                          })}`}
                        >
                          {city.name}
                        </Link>
                      </td>
                      <td className={`p-3 bg-[rgba(225,225,225,0.25)]`}>
                        {city.cou_name_en}
                      </td>
                      <td className={`p-3 bg-[rgba(225,225,225,0.25)]`}>
                        {city.timezone}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <>Something went wrong</>
        )} */}
        <div className="px-5 min-w-[1200px] w-full">
          <div
            className={`flex items-center py-3 text-white text-2xl font-bold`}
          >
            <button
              onClick={() => handleSort("name")}
              className={`block w-[40%] px-3`}
              disabled={isLoading}
            >
              <span
                className={`${
                  sortBy.curr === "name"
                    ? `showOrder ${sortBy.isAsc ? "asc" : "desc"}`
                    : ""
                }`}
              >
                City
              </span>
            </button>
            <button
              onClick={() => handleSort("cou_name_en")}
              className={`block w-[35%] px-3`}
              disabled={isLoading}
            >
              <span
                className={`${
                  sortBy.curr === "cou_name_en"
                    ? `showOrder ${sortBy.isAsc ? "asc" : "desc"}`
                    : ""
                }`}
              >
                Country
              </span>
            </button>
            <button
              onClick={() => handleSort("timezone")}
              className={`block w-[25%] px-3`}
              disabled={isLoading}
            >
              <span
                className={`${
                  sortBy.curr === "timezone"
                    ? `showOrder ${sortBy.isAsc ? "asc" : "desc"}`
                    : ""
                }`}
              >
                Timezone
              </span>
            </button>
          </div>
        </div>
        {allCities && allCities.length > 0 ? (
          <div className="px-5 min-w-[1200px] w-full">
            {/* <table className={`w-[100vw]`}>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Country</th>
                  <th>Timezone</th>
                </tr>
              </thead>

              <tbody>
                {allCities.map((city, i) => {
                  return (
                    <tr key={i} className="block mb-2">
                      <td className={`p-3 bg-[rgba(225,225,225,0.25)]`}>
                        <Link
                          to={`/weather/${JSON.stringify({
                            name: city.name,
                            geonameId: city.geoname_id,
                            lon: city.coordinates.lon,
                            lat: city.coordinates.lat,
                          })}`}
                        >
                          {city.name}
                        </Link>
                      </td>
                      <td className={`p-3 bg-[rgba(225,225,225,0.25)]`}>
                        {city.cou_name_en}
                      </td>
                      <td className={`p-3 bg-[rgba(225,225,225,0.25)]`}>
                        {city.timezone}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table> */}
            {allCities.map((city, i) => {
              return (
                <Link
                  key={i}
                  to={`/weather/${JSON.stringify({
                    name: city.name,
                    geonameId: city.geoname_id,
                    lon: city.coordinates.lon,
                    lat: city.coordinates.lat,
                  })}`}
                  className={`flex items-center py-3 divide-x bg-[rgba(225,225,225,0.125)] mb-3 text-white rounded-lg text-xl hover:bg-[rgba(225,225,225,0.25)] transition ease-in backdrop-blur-sm`}
                >
                  <div className={`w-[40%] px-3`}>{city.name}</div>
                  <div className={`w-[35%] px-4`}>{city.cou_name_en}</div>
                  <div className={`w-[25%] px-4`}>{city.timezone}</div>
                </Link>
              );
            })}
          </div>
        ) : isLoading ? (
          <h1 className="text-white text-center">Loading...</h1>
        ) : (
          <div className="text-white">Something went wrong</div>
        )}
      </div>
    </div>
  );
};

export default Cities;
