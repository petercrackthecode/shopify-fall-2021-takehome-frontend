import './App.css';
import { LibraryIcon, SearchIcon } from '@heroicons/react/solid';
import { useState, useRef, useEffect } from 'react';
import { keysIn } from 'lodash';

const axios = require('axios');
const _ = require('lodash');

function App() {
    const [isEditing, setEditing] = useState(true);
    const [query, setQuery] = useState('');
    const [movieList, setMovieList] = useState({});
    const [nominationList, setNominationList] = useState({});
    const [isFetchingData, setFetchDataStatus] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current != null) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (inputRef.current != null) {
            isEditing ? inputRef.current.focus() : inputRef.current.blur();
        }
    }, [isEditing]);

    useEffect(() => {
        setMovieList([]);
        if (query === '') return;

        (async () => {
            setFetchDataStatus(true);
            console.log('Start fetching data');
            console.log(`query = ${query}`);
            let totalResults = 0;
            await axios
                .get(`http://www.omdbapi.com/?s=${query}&apikey=5e2f01e8`)
                .then((response) => {
                    totalResults = response.data.totalResults;
                })
                .catch((error) => {
                    console.log(error);
                });

            // Each page will have at most 10 results from the API response.
            let page = 1;

            let newMovieList = {};
            while (totalResults > 0 && page <= 100) {
                await axios
                    .get(
                        `http://www.omdbapi.com/?s=${query}&page=${page}&apikey=5e2f01e8`
                    )
                    // eslint-disable-next-line no-loop-func
                    .then(function (response) {
                        // handle success
                        for (let item of response.data.Search) {
                            newMovieList[item.imdbID] = item;
                        }
                        console.log(newMovieList);
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                    })
                    .then(function () {
                        // always executed
                    });
                totalResults -= 10;
                ++page;
            }
            setMovieList(newMovieList);
            setFetchDataStatus(false);
            console.log('Done fetching data');
        })();
    }, [query]);

	const removeItem = (key) => {
		let newNominationList = _.cloneDeep(nominationList);
		delete newNominationList[key];
		setNominationList(newNominationList);
	}

	const nominateItem = (key) => {
		if (Object.keys(nominationList).length >= 5)
			return;

		let newNominationList = _.cloneDeep(nominationList);
		newNominationList[key] = movieList[key];
		setNominationList(newNominationList);
	}

    return (
        <div className="app container flex flex-col justify-center items-center text-white">
            <div className="border-2 rounded p-4 flex flex-col items-start">
                <h1 className="font-bold text-xl">The Shoppies</h1>
                <div className="my-10">
                    <h1 className="">Movie title</h1>
                    <div
                        className="border-1 p-1 rounded flex flex-row"
                        onFocus={() => setEditing(true)}
                        onClick={() => setEditing(true)}
                        onBlur={() => setEditing(false)}
                    >
                        <SearchIcon className="w-5 h-5" />
                        <input
                            type="text"
                            className="bg-transparent"
                            ref={inputRef}
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                            }}
                        />
                    </div>
                </div>
                <div className="flex flex-row justify-evenly items-center border-8 border-black">
                    {query !== '' ? (
                        isFetchingData ? (
                            <div className="loader mr-5" />
                        ) : (
                            <div className="search-result flex flex-col overflow-y-scroll w-1/2">
                                <p>{`Result for "${query}"`}</p>
                                <ul>
                                    {Object.keys(movieList).map((key, index) =>
                                        Card(
                                            movieList[key],
                                            `${movieList[key].imdbID}${index}`,
                                            'Nominate',
                                            nominationList.hasOwnProperty(
                                                movieList[key].imdbID
                                            ),
											() => nominateItem(movieList[key].imdbID)
                                        )
                                    )}
                                </ul>
                            </div>
                        )
                    ) : null}
                    <div className="border border-white p-4 h-full">
                        <p>Nominations</p>
                        <ul className="overflow-y-scroll">
                            {Object.keys(nominationList).map((key, index) =>
                                Card(
                                    nominationList[key],
                                    `${nominationList[key].imdbID}${index}`,
                                    'Remove',
                                    false,
									() => removeItem(nominationList[key].imdbID)
                                )
                            )}
                        </ul>
						<div className={Object.keys(nominationList).length >= 5 ? "block" : "hidden"}>You have nominated 5 movies. Your nomination list is completed!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Card = (item, key, action, disabled, onClick) => {
    return (
        <li className="movie-card flex flex-row items-center my-3" key={key}>
            <p className="mr-3">
                {item.Title} ({item.Year})
            </p>
            <button
                type="button"
                className={`border-2 border-white rounded-md p-2 ${disabled ? "" : "hover:opacity-70"}`}
                disabled={disabled}
				onClick={onClick}
            >
                {action}
            </button>
        </li>
    );
};

export default App;
