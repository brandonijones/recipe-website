import { React, useState, useEffect } from 'react';

import RecipeCard from '../components/RecipeCard';
import ProfileCard from '../components/ProfileCard';

import Dropdown  from 'react-bootstrap/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SearchService from '../services/SearchService';
import Loading from '../components/Loading';

import Landing from '../images/recipe-website-landing-page.png';

function Home() {
    const [query, setQuery] = useState("");
    const [recipeQuerySent, setRecipeQuerySent] = useState(false);
    const [userQuerySent, setUserQuerySent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recipeResults, setRecipeResults] = useState([]);
    const [accountResults, setAccountResults] = useState([]);
    const searchTypes = ["Recipes", "Users"];
    const [searchType, setSearchType] = useState(searchTypes[0]);
    

    const searchQuery = () => {
        setIsLoading(true);
        console.log(query);
        if (searchType === searchTypes[0]) {
            SearchService.findRecipes(query).then((response) => {
                console.log(response.data);
                setRecipeResults(response.data);
                setRecipeQuerySent(true);
                setUserQuerySent(false);
                setIsLoading(false);
            });
        }

        if (searchType === searchTypes[1]) {
            SearchService.findAccounts(query).then((response) => {
                console.log(response.data);
                setAccountResults(response.data);
                setUserQuerySent(true);
                setRecipeQuerySent(false);
                setIsLoading(false);
            });
        }
        
    }

    return (
        <div className=' my-5 container' style={{"maxWidth": "70rem"}}>
            <div className='home-landing text-center my-3'>
                <img className='img-fluid' src={Landing} alt="The Recipe Bowl logo" />
            </div>
            <div className='mx-auto search-bar row gx-2 gy-3'>
                <div className='col-md-2 col-sm-2 col-12 mx-auto'>
                    <Dropdown>
                        <Dropdown.Toggle variant='secondary'>
                            {searchType}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setSearchType(searchTypes[0])}>{searchTypes[0]}</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSearchType(searchTypes[1])} >{searchTypes[1]}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                </div>
                <div className='col-md-6 col-sm-6 col-12'>
                    <input 
                        type="text"
                        value={query}
                        className='form-control'
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search for ${searchType.toLowerCase()}...`}
                    />
                </div>
                <div className='col-md-3 col-sm-3 text-center'>
                    <button className='btn btn-primary' onClick={searchQuery}> <FontAwesomeIcon icon={faSearch} /> Search</button>
                </div>
            </div>
            <hr />
            <div>
                { isLoading ? 
                    <Loading /> :
                    <div>
                        { recipeQuerySent &&
                            <>
                                <p className='text-center'>{recipeResults.length} result(s) found!</p>
                                <div className='row g-3'>
                                    {recipeResults.length > 0 ?
                                        <>
                                            {recipeResults.map((recipe, index) => {
                                                return (
                                                    <RecipeCard recipe={recipe} index={index} />
                                                );
                                            })}
                                        </> :
                                        <p className='text-center my-3' >No results found</p>
                                    }
                                </div>
                            </>
                        }

                        { userQuerySent &&
                            <>
                                <p className='text-center'>{accountResults.length} result(s) found!</p>
                                <div className='row g-3'>
                                    {accountResults.length > 0 ?
                                        <>
                                            {accountResults.map((account, index) => {
                                                return (
                                                    <ProfileCard account={account} index={index} />
                                                );
                                            })}
                                        </> :
                                        <p className='text-center my-3' >No results found</p>
                                    }
                                </div>
                            </>

                        }
                    </div>
                }
            </div>
            
        </div>
    );
}

export default Home;