"use client"

import { useState, useEffect, useRef } from "react"
import { VectorMap } from "@south-paw/react-vector-maps"
import worldMap from "../Components/Assets/world.json"
import "./FrontPage.css"
import PromptBox from "../Components/PromptingBox/PromptBox"
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import wisk_icon from "../Components/Assets/wisk.png"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import RecipeCard from "../Components/RecipeCard/RecipeCard"
import SmallRecipeCard from "../Components/SmallRecipeCard/SmallRecipeCard"
import ProgressBar from "@ramonak/react-progress-bar"
import axios from "axios"
import Globe3D from "../Components/Globe3D/Globe3D"

const BASE_USER_RECIPES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/user-recipe"
const BASE_USER_INFO = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/getUserData"
const BASE_USER_COUNTRIES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth/getUserCountries"
const BASE_RECIPES_URL = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/recipes"
const BASE_RECOMMEND_RECIPES_URL =
  "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/recommendations/personalized"
const BASE_USER_PREFERENCES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth/getUserData"

function FrontPage() {
  const Map = styled.div`
        width: 100% !important;
        max-width: 1200px;
        margin: 0 auto;

        svg {
            stroke: rgb(0,0,0);
            width: 100%;
            height: auto;

            path {
                fill: rgb(255, 255, 255);
                cursor: pointer;
                outline: none;
                transition: all 0.3s ease;

                &:hover {
                    fill: #2d8b4e;
                }

                &:focus {
                    fill: #2d8b4e;
                }

                &[aria-checked='true'] {
                    fill: #2d8b4e !important;
                }

                &[aria-current='true'] {
                    fill: #2d8b4e !important;
                }
            }
        }
        `
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const { getCode, getName } = require("country-list")
  const [selectedCountryList, setSelectedCountryList] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [completedCountries, setCountries] = useState([])
  const [completedCountriesCount, setCountriesCount] = useState(0)
  const [recommendedRecipes, setRecommendedRecipes] = useState([])
  const [tooltipRef, setTooltipRef] = useState(null)
  const mapContainerRef = useRef(null)
  const [is3DView, setIs3DView] = useState(false)

  useEffect(() => {
    // Create tooltip element if it doesn't exist
    if (!tooltipRef) {
      const tooltip = document.createElement("div")
      tooltip.className = "map-tooltip"
      document.body.appendChild(tooltip)
      setTooltipRef(tooltip)
    }

    // Clean up when component unmounts
    return () => {
      if (tooltipRef) {
        document.body.removeChild(tooltipRef)
      }
    }
  }, [])

  const handleMouseMove = (e) => {
    if (tooltipRef) {
      tooltipRef.style.left = `${e.clientX}px`
      tooltipRef.style.top = `${e.clientY}px`
    }
  }

  const mapLayerProps = {
    onClick: ({ target }) => handleCountryClick(target.attributes.name.value),
    onMouseEnter: ({ target }) => {
      const countryName = target.attributes.name.value
      // Update tooltip content and make it visible
      if (tooltipRef) {
        tooltipRef.textContent = countryName
        tooltipRef.style.display = "block"
      }
    },
    onMouseLeave: () => {
      // Hide tooltip
      if (tooltipRef) {
        tooltipRef.style.display = "none"
      }
    },
    onMouseMove: handleMouseMove,
    style: {
      cursor: "pointer",
      transition: "fill 0.2s ease",
    },
  }

  const handleCountryClick = (countrySelect) => {
    // Reset the selection if clicking the same country again
    if (countrySelect === selectedCountry) {
      setSelectedCountry(null)
      setSelectedCountryList([])
      return
    }

    setSelectedCountry(countrySelect)

    if (countrySelect !== undefined) {
      const countrySelectLower = countrySelect.toLowerCase()

      const matchingRecipes = history.filter((r) => {
        if (!r.recipe.origin || !r.recipe.origin.country) {
          return false
        }

        const recipeCountry = r.recipe.origin.country.toLowerCase()

        // Direct match
        if (recipeCountry === countrySelectLower) {
          return true
        }

        // Check common variations
        const variations = {
          // A
          af: ["afghanistan", "afghan"],
          al: ["albania", "albanian"],
          dz: ["algeria", "algerian"],
          ad: ["andorra", "andorran"],
          ao: ["angola", "angolan"],
          ag: ["antigua and barbuda", "antiguan"],
          ar: ["argentina", "argentinian"],
          am: ["armenia", "armenian"],
          au: ["australia", "australian"],
          at: ["austria", "austrian"],
          az: ["azerbaijan", "azerbaijani"],

          // B
          bs: ["bahamas", "bahamian"],
          bh: ["bahrain", "bahraini"],
          bd: ["bangladesh", "bangladeshi"],
          bb: ["barbados", "barbadian"],
          by: ["belarus", "belarusian"],
          be: ["belgium", "belgian"],
          bz: ["belize", "belizean"],
          bj: ["benin", "beninese"],
          bt: ["bhutan", "bhutanese"],
          bo: ["bolivia", "bolivian"],
          ba: ["bosnia and herzegovina", "bosnian"],
          bw: ["botswana", "botswanan"],
          br: ["brazil", "brazilian"],
          bn: ["brunei", "bruneian"],
          bg: ["bulgaria", "bulgarian"],
          bf: ["burkina faso", "burkinabe"],
          bi: ["burundi", "burundian"],

          // C
          cv: ["cabo verde", "cape verdean"],
          kh: ["cambodia", "cambodian"],
          cm: ["cameroon", "cameroonian"],
          ca: ["canada", "canadian"],
          cf: ["central african republic", "central african"],
          td: ["chad", "chadian"],
          cl: ["chile", "chilean"],
          cn: ["china", "chinese"],
          co: ["colombia", "colombian"],
          km: ["comoros", "comorian"],
          cg: ["congo", "congolese"],
          cr: ["costa rica", "costa rican"],
          hr: ["croatia", "croatian"],
          cu: ["cuba", "cuban"],
          cy: ["cyprus", "cypriot"],
          cz: ["czech republic", "czech"],

          // D
          dk: ["denmark", "danish"],
          dj: ["djibouti", "djiboutian"],
          dm: ["dominica", "dominican"],
          do: ["dominican republic", "dominican"],

          // E
          ec: ["ecuador", "ecuadorian"],
          eg: ["egypt", "egyptian"],
          sv: ["el salvador", "salvadoran"],
          gq: ["equatorial guinea", "equatoguinean"],
          er: ["eritrea", "eritrean"],
          ee: ["estonia", "estonian"],
          sz: ["eswatini", "swazi"],
          et: ["ethiopia", "ethiopian"],

          // F
          fj: ["fiji", "fijian"],
          fi: ["finland", "finnish"],
          fr: ["france", "french"],

          // G
          ga: ["gabon", "gabonese"],
          gm: ["gambia", "gambian"],
          ge: ["georgia", "georgian"],
          de: ["germany", "german"],
          gh: ["ghana", "ghanaian"],
          gr: ["greece", "greek"],
          gd: ["grenada", "grenadian"],
          gt: ["guatemala", "guatemalan"],
          gn: ["guinea", "guinean"],
          gw: ["guinea-bissau", "bissau-guinean"],
          gy: ["guyana", "guyanese"],

          // H
          ht: ["haiti", "haitian"],
          hn: ["honduras", "honduran"],
          hu: ["hungary", "hungarian"],

          // I
          is: ["iceland", "icelandic"],
          in: ["india", "indian"],
          id: ["indonesia", "indonesian"],
          ir: ["iran", "iranian", "persian"],
          iq: ["iraq", "iraqi"],
          ie: ["ireland", "irish"],
          il: ["israel", "israeli"],
          it: ["italy", "italian"],

          // J
          jm: ["jamaica", "jamaican"],
          jp: ["japan", "japanese"],
          jo: ["jordan", "jordanian"],

          // K
          kz: ["kazakhstan", "kazakh"],
          ke: ["kenya", "kenyan"],
          ki: ["kiribati", "i-kiribati"],
          kp: ["north korea", "korean", "korean"],
          kr: ["south korea", "korean", "korean"],
          kw: ["kuwait", "kuwaiti"],
          kg: ["kyrgyzstan", "kyrgyz"],

          // L
          la: ["laos", "lao", "laotian"],
          lv: ["latvia", "latvian"],
          lb: ["lebanon", "lebanese"],
          ls: ["lesotho", "basotho"],
          lr: ["liberia", "liberian"],
          ly: ["libya", "libyan"],
          li: ["liechtenstein", "liechtensteiner"],
          lt: ["lithuania", "lithuanian"],
          lu: ["luxembourg", "luxembourgish"],

          // M
          mg: ["madagascar", "malagasy"],
          mw: ["malawi", "malawian"],
          my: ["malaysia", "malaysian"],
          mv: ["maldives", "maldivian"],
          ml: ["mali", "malian"],
          mt: ["malta", "maltese"],
          mh: ["marshall islands", "marshallese"],
          mr: ["mauritania", "mauritanian"],
          mu: ["mauritius", "mauritian"],
          mx: ["mexico", "mexican"],
          fm: ["micronesia", "micronesian"],
          md: ["moldova", "moldovan"],
          mc: ["monaco", "monacan"],
          mn: ["mongolia", "mongolian"],
          me: ["montenegro", "montenegrin"],
          ma: ["morocco", "moroccan"],
          mz: ["mozambique", "mozambican"],
          mm: ["myanmar", "burmese"],

          // N
          na: ["namibia", "namibian"],
          nr: ["nauru", "nauruan"],
          np: ["nepal", "nepalese", "nepali"],
          nl: ["netherlands", "dutch"],
          nz: ["new zealand", "new zealander", "kiwi"],
          ni: ["nicaragua", "nicaraguan"],
          ne: ["niger", "nigerien"],
          ng: ["nigeria", "nigerian"],
          mk: ["north macedonia", "macedonian"],
          no: ["norway", "norwegian"],

          // O
          om: ["oman", "omani"],

          // P
          pk: ["pakistan", "pakistani"],
          pw: ["palau", "palauan"],
          pa: ["panama", "panamanian"],
          pg: ["papua new guinea", "papua new guinean"],
          py: ["paraguay", "paraguayan"],
          pe: ["peru", "peruvian"],
          ph: ["philippines", "filipino", "philippine"],
          pl: ["poland", "polish"],
          pt: ["portugal", "portuguese"],

          // Q
          qa: ["qatar", "qatari"],

          // R
          ro: ["romania", "romanian"],
          ru: ["russia", "russian"],
          rw: ["rwanda", "rwandan"],

          // S
          kn: ["saint kitts and nevis", "kittitian", "nevisian"],
          lc: ["saint lucia", "saint lucian"],
          vc: ["saint vincent and the grenadines", "vincentian"],
          ws: ["samoa", "samoan"],
          sm: ["san marino", "sammarinese"],
          st: ["sao tome and principe", "sao tomean"],
          sa: ["saudi arabia", "saudi", "saudi arabian"],
          sn: ["senegal", "senegalese"],
          rs: ["serbia", "serbian"],
          sc: ["seychelles", "seychellois"],
          sl: ["sierra leone", "sierra leonean"],
          sg: ["singapore", "singaporean"],
          sk: ["slovakia", "slovak"],
          si: ["slovenia", "slovenian"],
          sb: ["solomon islands", "solomon islander"],
          so: ["somalia", "somali"],
          za: ["south africa", "south african"],
          ss: ["south sudan", "south sudanese"],
          es: ["spain", "spanish"],
          lk: ["sri lanka", "sri lankan"],
          sd: ["sudan", "sudanese"],
          sr: ["suriname", "surinamese"],
          se: ["sweden", "swedish"],
          ch: ["switzerland", "swiss"],
          sy: ["syria", "syrian"],

          // T
          tw: ["taiwan", "taiwanese"],
          tj: ["tajikistan", "tajik"],
          tz: ["tanzania", "tanzanian"],
          th: ["thailand", "thai"],
          tl: ["timor-leste", "east timorese"],
          tg: ["togo", "togolese"],
          to: ["tonga", "tongan"],
          tt: ["trinidad and tobago", "trinidadian", "tobagonian"],
          tn: ["tunisia", "tunisian"],
          tr: ["turkey", "turkish"],
          tm: ["turkmenistan", "turkmen"],
          tv: ["tuvalu", "tuvaluan"],

          // U
          ug: ["uganda", "ugandan"],
          ua: ["ukraine", "ukrainian"],
          ae: ["united arab emirates", "emirati"],
          gb: ["united kingdom", "british", "great britain"],
          us: ["united states", "usa", "united states of america", "american"],
          uy: ["uruguay", "uruguayan"],
          uz: ["uzbekistan", "uzbek"],

          // V
          vu: ["vanuatu", "ni-vanuatu"],
          va: ["vatican city", "vatican"],
          ve: ["venezuela", "venezuelan"],
          vn: ["vietnam", "vietnamese"],

          // Y
          ye: ["yemen", "yemeni"],

          // Z
          zm: ["zambia", "zambian"],
          zw: ["zimbabwe", "zimbabwean"],
        }

        // Check if the recipe country matches any variation of the selected country
        if (variations[countrySelectLower] && variations[countrySelectLower].includes(recipeCountry)) {
          return true
        }

        // Check reverse mapping (if recipe has code and selected is full name)
        for (const [code, names] of Object.entries(variations)) {
          if (names.includes(countrySelectLower) && recipeCountry === code) {
            return true
          }
        }

        return false
      })

      console.log(`Found ${matchingRecipes.length} recipes for ${countrySelect}`)
      setSelectedCountryList(matchingRecipes)
    }
  }

  const handleCloseCountryRecipes = () => {
    setSelectedCountry(null)
    setSelectedCountryList([])
  }

  const historylist =
    history && history.length > 0 ? (
      history.map((item, index) => (
        <div key={`recipe-${index}`} onClick={() => recipeClicked(item.recipeId)}>
          <RecipeCard image={item.recipe?.image} name={item.recipe?.title} />
        </div>
      ))
    ) : (
      <p>No recipe history available</p>
    )

  const recipeClicked = (recipeID) => {
    navigate("/Recipe", { state: { recipeID } })
  }
  const getCountries = async () => {
    try {
      const token = localStorage.getItem("authToken")
      console.log("Fetching countries data...")
      const response = await fetch(BASE_USER_COUNTRIES, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const jsonResponse = await response.json()
      console.log("Full countries response:", jsonResponse)

      // Get the country codes and filter out null/undefined values
      const countriesCompletedIDs = jsonResponse.countriesCompletedIDs || []
      console.log("Raw country codes:", countriesCompletedIDs)

      // Convert to lowercase and ensure they match the map's format
      const formattedCountryCodes = countriesCompletedIDs
        .filter((code) => code !== null && code !== undefined)
        .map((code) => code.toLowerCase())
        .map((code) => {
          // Special handling for certain country codes if needed
          // For example, if 'USA' needs to be 'us', or 'GBR' needs to be 'gb'
          switch (code) {
            case "usa":
              return "us"
            case "gbr":
              return "gb"
            // Add more cases as needed
            default:
              return code
          }
        })

      console.log("Formatted country codes for map:", formattedCountryCodes)

      // Update the state
      setCountries(formattedCountryCodes)
      setCountriesCount(formattedCountryCodes.length)

      // Log the current state of the map's layers
      console.log("Current map layers:", completedCountries)
    } catch (error) {
      console.error("Error fetching countries:", error)
      setCountries([])
      setCountriesCount(0)
    }
  }
  const getHistory = async () => {
    try {
      const token = localStorage.getItem("authToken")
      console.log("Fetching recipe history...")

      const response = await fetch(BASE_USER_RECIPES, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Recipe history received:", data)

      // Make sure we have recipes before setting them
      if (data && Array.isArray(data.recipes)) {
        setHistory(data.recipes)

        // Extract and format country codes from recipe history
        const completedCountryCodes = [
          ...new Set(
            data.recipes
              .filter((recipe) => recipe.recipe.origin && recipe.recipe.origin.country)
              .map((recipe) => {
                const country = recipe.recipe.origin.country.toLowerCase()
                // Map country names to their ISO codes
                const countryMappings = {
                  "united states": "us",
                  usa: "us",
                  "united states of america": "us",
                  "united kingdom": "gb",
                  "great britain": "gb",
                  italy: "it",
                  france: "fr",
                  spain: "es",
                  germany: "de",
                  china: "cn",
                  japan: "jp",
                  mexico: "mx",
                  india: "in",
                  thailand: "th",
                  vietnam: "vn",
                  greece: "gr",
                  turkey: "tr",
                  morocco: "ma",
                  // Add more mappings as needed
                }

                console.log("Processing country:", country)
                const mappedCode = countryMappings[country] || country
                console.log("Mapped to:", mappedCode)
                return mappedCode
              }),
          ),
        ]

        console.log("Formatted country codes for map:", completedCountryCodes)

        // Update the completed countries state
        setCountries(completedCountryCodes)
        setCountriesCount(completedCountryCodes.length)
      } else {
        console.log("No recipes found in response:", data)
        setHistory([])
        setCountries([])
        setCountriesCount(0)
      }
    } catch (error) {
      console.error("Error fetching recipe history:", error)
      setHistory([])
      setCountries([])
      setCountriesCount(0)
    }
  }
  const getRecommendedRecipes = async () => {
    // Check if we already have cached recommendations in this session
    const cachedRecommendations = sessionStorage.getItem("recommendedRecipes")
    if (cachedRecommendations) {
      console.log("Using cached recommended recipes")
      setRecommendedRecipes(JSON.parse(cachedRecommendations))
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${BASE_RECOMMEND_RECIPES_URL}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Recommended recipes received:", data)

      if (data && Array.isArray(data.results)) {
        // Cache the recommendations in sessionStorage
        sessionStorage.setItem("recommendedRecipes", JSON.stringify(data.results))
        setRecommendedRecipes(data.results)
      } else {
        console.log("No recipes found, trying without filters...")
        // Try one more time without any filters
        const fallbackResponse = await axios.get(`${BASE_RECIPES_URL}/search`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            number: 4,
            instructionsRequired: true,
          },
        });

        if (fallbackResponse.data && fallbackResponse.data.results) {
          console.log("Fallback found recipes:", fallbackResponse.data.results.length)
          setRecommendedRecipes(fallbackResponse.data.results)
        }
      }
    } catch (error) {
      console.error("Error fetching recommended recipes:", error)
      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      }
    }
  }
  const checkUserPreferences = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.get(BASE_USER_PREFERENCES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("User preferences:", response.data?.preferences)
    } catch (error) {
      console.error("Error fetching user preferences:", error)
    }
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    checkUserPreferences()
    getHistory()
    getRecommendedRecipes()
  }, [])

  const handleAccountClick = () => {
    navigate("/account")
  }

  const handlePastRecipesClick = () => {
    navigate("/pastrecipes")
  }

  const handleBrandClick = () => {
    navigate("/home")
  }

  const handleChallengesClick = () => {
    navigate("/challenges")
  }

  const handleLogout = () => {
    // Clear the auth token
    localStorage.removeItem("authToken")
    // Navigate to login page
    navigate("/")
  }

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  }

  const CustomProgressBar = () => {
    const validCountryCodes = completedCountries.length;
    const percentage = validCountryCodes > 0 ? Math.min(Math.round((validCountryCodes / 195) * 100), 100) : 0;

    return (
      <>
        <div className="progress-stats">
          <span>{validCountryCodes} of 195 countries explored</span>
          <span>{percentage}% completed</span>
        </div>
        <div className="progress-bar">
          <ProgressBar
            completed={percentage}
            bgColor="#0d4725"
            height="15px"
            labelColor="#ffffff"
            labelSize="10px"
            baseBgColor="#e0e0de"
            customLabel={`${percentage}%`}
          />
        </div>
      </>
    );
  };

  const recommendedList =
    recommendedRecipes.length > 0 ? (
      recommendedRecipes.map((recipe, index) => (
        <div key={`recommended-${index}`} onClick={() => recipeClicked(recipe.id)}>
          <RecipeCard image={recipe.image} name={recipe.title} />
        </div>
      ))
    ) : (
      <div style={{ textAlign: "center", width: "100%" }}>
        <p>Loading recommended recipes...</p>
      </div>
    )

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "recipeCompleted") {
        // Only refresh recipe history, not recommended recipes
        getHistory()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  useEffect(() => {
    console.log("completedCountries updated:", completedCountries)
  }, [completedCountries])

  // Handle when mouse leaves the entire map container
  const handleMapMouseLeave = () => {
    if (tooltipRef) {
      tooltipRef.style.display = "none"
    }
  }

  // Add this function to handle mouse leaving the SVG map specifically
  const handleSvgMapMouseLeave = () => {
    if (tooltipRef) {
      tooltipRef.style.display = "none"
    }
  }

  const getCountryRegion = (countryCode) => {
    // More comprehensive region mapping
    const regionMap = {
      // North America
      us: "North America",
      ca: "North America",
      mx: "North America",
      gt: "North America",
      bz: "North America",
      sv: "North America",
      hn: "North America",
      ni: "North America",
      cr: "North America",
      pa: "North America",
      cu: "North America",
      jm: "North America",
      ht: "North America",
      do: "North America",
      pr: "North America",

      // South America
      co: "South America",
      ve: "South America",
      gy: "South America",
      sr: "South America",
      gf: "South America",
      br: "South America",
      ec: "South America",
      pe: "South America",
      bo: "South America",
      py: "South America",
      cl: "South America",
      ar: "South America",
      uy: "South America",

      // Europe
      is: "Europe",
      no: "Europe",
      se: "Europe",
      fi: "Europe",
      ee: "Europe",
      lv: "Europe",
      lt: "Europe",
      by: "Europe",
      pl: "Europe",
      de: "Europe",
      dk: "Europe",
      gb: "Europe",
      ie: "Europe",
      nl: "Europe",
      be: "Europe",
      lu: "Europe",
      fr: "Europe",
      ch: "Europe",
      at: "Europe",
      cz: "Europe",
      sk: "Europe",
      hu: "Europe",
      si: "Europe",
      hr: "Europe",
      ba: "Europe",
      rs: "Europe",
      me: "Europe",
      al: "Europe",
      mk: "Europe",
      gr: "Europe",
      bg: "Europe",
      ro: "Europe",
      md: "Europe",
      ua: "Europe",
      it: "Europe",
      es: "Europe",
      pt: "Europe",
      ad: "Europe",
      mc: "Europe",
      sm: "Europe",
      va: "Europe",
      mt: "Europe",
      cy: "Europe",

      // Asia
      ru: "Asia",
      kz: "Asia",
      uz: "Asia",
      tm: "Asia",
      kg: "Asia",
      tj: "Asia",
      mn: "Asia",
      cn: "Asia",
      kp: "Asia",
      kr: "Asia",
      jp: "Asia",
      tw: "Asia",
      hk: "Asia",
      mo: "Asia",
      ph: "Asia",
      vn: "Asia",
      la: "Asia",
      kh: "Asia",
      th: "Asia",
      mm: "Asia",
      my: "Asia",
      bn: "Asia",
      sg: "Asia",
      id: "Asia",
      tl: "Asia",
      np: "Asia",
      bt: "Asia",
      bd: "Asia",
      in: "Asia",
      pk: "Asia",
      af: "Asia",
      ir: "Asia",
      iq: "Asia",
      sy: "Asia",
      tr: "Asia",
      az: "Asia",
      am: "Asia",
      ge: "Asia",
      lb: "Asia",
      il: "Asia",
      ps: "Asia",
      jo: "Asia",
      sa: "Asia",
      ye: "Asia",
      om: "Asia",
      ae: "Asia",
      qa: "Asia",
      kw: "Asia",
      bh: "Asia",

      // Africa
      eg: "Africa",
      ly: "Africa",
      tn: "Africa",
      dz: "Africa",
      ma: "Africa",
      mr: "Africa",
      ml: "Africa",
      ne: "Africa",
      td: "Africa",
      sd: "Africa",
      er: "Africa",
      dj: "Africa",
      so: "Africa",
      et: "Africa",
      ss: "Africa",
      ke: "Africa",
      ug: "Africa",
      tz: "Africa",
      rw: "Africa",
      bi: "Africa",
      cd: "Africa",
      cg: "Africa",
      ga: "Africa",
      gq: "Africa",
      cm: "Africa",
      cf: "Africa",
      ng: "Africa",
      bj: "Africa",
      tg: "Africa",
      gh: "Africa",
      ci: "Africa",
      lr: "Africa",
      sl: "Africa",
      gn: "Africa",
      gw: "Africa",
      sn: "Africa",
      gm: "Africa",
      cv: "Africa",
      mz: "Africa",
      zw: "Africa",
      za: "Africa",
      ls: "Africa",
      sz: "Africa",
      na: "Africa",
      bw: "Africa",
      zm: "Africa",
      mw: "Africa",
      ao: "Africa",
      mg: "Africa",
      mu: "Africa",
      sc: "Africa",
      km: "Africa",

      // Oceania
      au: "Oceania",
      nz: "Oceania",
      pg: "Oceania",
      sb: "Oceania",
      vu: "Oceania",
      nc: "Oceania",
      fj: "Oceania",
      ws: "Oceania",
      to: "Oceania",
      tv: "Oceania",
      ki: "Oceania",
      mh: "Oceania",
      fm: "Oceania",
      pw: "Oceania",
      nr: "Oceania",
    }

    // Handle case sensitivity and common variations
    const code = countryCode.toLowerCase()

    // Try direct lookup first
    if (regionMap[code]) {
      return regionMap[code]
    }

    // Handle special cases or full country names
    const specialCases = {
      "united states": "North America",
      usa: "North America",
      "united kingdom": "Europe",
      "great britain": "Europe",
      china: "Asia",
      india: "Asia",
      australia: "Oceania",
      brazil: "South America",
      "south africa": "Africa",
      russia: "Asia",
      japan: "Asia",
      // Add more as needed
    }

    if (specialCases[code]) {
      return specialCases[code]
    }

    // If we can't determine the region, return unknown
    return "Unknown Region"
  }

  // Helper function to convert country name to ISO code for flag display
  const getCountryIsoCode = (countryName) => {
    if (!countryName) return ""

    // Convert to lowercase for case-insensitive matching
    const name = countryName.toLowerCase()

    // Direct ISO code mapping (if the country is already in code format)
    if (name.length === 2) {
      return name
    }

    // Comprehensive country name to ISO code mappings
    const countryCodeMap = {
      // A
      afghanistan: "af",
      albania: "al",
      algeria: "dz",
      andorra: "ad",
      angola: "ao",
      "antigua and barbuda": "ag",
      argentina: "ar",
      armenia: "am",
      australia: "au",
      austria: "at",
      azerbaijan: "az",

      // B
      bahamas: "bs",
      bahrain: "bh",
      bangladesh: "bd",
      barbados: "bb",
      belarus: "by",
      belgium: "be",
      belize: "bz",
      benin: "bj",
      bhutan: "bt",
      bolivia: "bo",
      "bosnia and herzegovina": "ba",
      botswana: "bw",
      brazil: "br",
      brunei: "bn",
      bulgaria: "bg",
      "burkina faso": "bf",
      burundi: "bi",

      // C
      "cabo verde": "cv",
      "cape verde": "cv",
      cambodia: "kh",
      cameroon: "cm",
      canada: "ca",
      "central african republic": "cf",
      chad: "td",
      chile: "cl",
      china: "cn",
      colombia: "co",
      comoros: "km",
      congo: "cg",
      "democratic republic of the congo": "cd",
      "dr congo": "cd",
      "costa rica": "cr",
      "cote d'ivoire": "ci",
      "ivory coast": "ci",
      croatia: "hr",
      cuba: "cu",
      cyprus: "cy",
      "czech republic": "cz",
      czechia: "cz",

      // D
      denmark: "dk",
      djibouti: "dj",
      dominica: "dm",
      "dominican republic": "do",

      // E
      ecuador: "ec",
      egypt: "eg",
      "el salvador": "sv",
      "equatorial guinea": "gq",
      eritrea: "er",
      estonia: "ee",
      eswatini: "sz",
      swaziland: "sz",
      ethiopia: "et",

      // F
      fiji: "fj",
      finland: "fi",
      france: "fr",

      // G
      gabon: "ga",
      gambia: "gm",
      georgia: "ge",
      germany: "de",
      ghana: "gh",
      greece: "gr",
      grenada: "gd",
      guatemala: "gt",
      guinea: "gn",
      "guinea-bissau": "gw",
      guyana: "gy",

      // H
      haiti: "ht",
      honduras: "hn",
      hungary: "hu",

      // I
      iceland: "is",
      india: "in",
      indonesia: "id",
      iran: "ir",
      iraq: "iq",
      ireland: "ie",
      israel: "il",
      italy: "it",

      // J
      jamaica: "jm",
      japan: "jp",
      jordan: "jo",

      // K
      kazakhstan: "kz",
      kenya: "ke",
      kiribati: "ki",
      korea: "kr",
      "south korea": "kr",
      "north korea": "kp",
      kosovo: "xk",
      kuwait: "kw",
      kyrgyzstan: "kg",

      // L
      laos: "la",
      latvia: "lv",
      lebanon: "lb",
      lesotho: "ls",
      liberia: "lr",
      libya: "ly",
      liechtenstein: "li",
      lithuania: "lt",
      luxembourg: "lu",

      // M
      madagascar: "mg",
      malawi: "mw",
      malaysia: "my",
      maldives: "mv",
      mali: "ml",
      malta: "mt",
      "marshall islands": "mh",
      mauritania: "mr",
      mauritius: "mu",
      mexico: "mx",
      micronesia: "fm",
      moldova: "md",
      monaco: "mc",
      mongolia: "mn",
      montenegro: "me",
      morocco: "ma",
      mozambique: "mz",
      myanmar: "mm",
      burma: "mm",

      // N
      namibia: "na",
      nauru: "nr",
      nepal: "np",
      netherlands: "nl",
      holland: "nl",
      "new zealand": "nz",
      nicaragua: "ni",
      niger: "ne",
      nigeria: "ng",
      "north macedonia": "mk",
      macedonia: "mk",
      norway: "no",

      // O
      oman: "om",

      // P
      pakistan: "pk",
      palau: "pw",
      palestine: "ps",
      panama: "pa",
      "papua new guinea": "pg",
      paraguay: "py",
      peru: "pe",
      philippines: "ph",
      poland: "pl",
      portugal: "pt",

      // Q
      qatar: "qa",

      // R
      romania: "ro",
      russia: "ru",
      rwanda: "rw",

      // S
      "saint kitts and nevis": "kn",
      "saint lucia": "lc",
      "saint vincent and the grenadines": "vc",
      samoa: "ws",
      "san marino": "sm",
      "sao tome and principe": "st",
      "saudi arabia": "sa",
      senegal: "sn",
      serbia: "rs",
      seychelles: "sc",
      "sierra leone": "sl",
      singapore: "sg",
      slovakia: "sk",
      slovenia: "si",
      "solomon islands": "sb",
      somalia: "so",
      "south africa": "za",
      "south sudan": "ss",
      spain: "es",
      "sri lanka": "lk",
      sudan: "sd",
      suriname: "sr",
      sweden: "se",
      switzerland: "ch",
      syria: "sy",

      // T
      taiwan: "tw",
      tajikistan: "tj",
      tanzania: "tz",
      thailand: "th",
      "timor-leste": "tl",
      "east timor": "tl",
      togo: "tg",
      tonga: "to",
      "trinidad and tobago": "tt",
      tunisia: "tn",
      turkey: "tr",
      turkmenistan: "tm",
      tuvalu: "tv",

      // U
      uganda: "ug",
      ukraine: "ua",
      "united arab emirates": "ae",
      uae: "ae",
      "united kingdom": "gb",
      uk: "gb",
      "great britain": "gb",
      england: "gb",
      "united states": "us",
      "united states of america": "us",
      usa: "us",
      uruguay: "uy",
      uzbekistan: "uz",

      // V
      vanuatu: "vu",
      "vatican city": "va",
      "holy see": "va",
      venezuela: "ve",
      vietnam: "vn",

      // Y
      yemen: "ye",

      // Z
      zambia: "zm",
      zimbabwe: "zw",

      // Adding a few missing or commonly used variations
      america: "us",

      scotland: "gb",
      wales: "gb",
      "northern ireland": "gb",

      "russian federation": "ru",

      "peoples republic of china": "cn",
      "people's republic of china": "cn",

      "viet nam": "vn",
      vietnamese: "vn",

      "republic of korea": "kr",
      "democratic people's republic of korea": "kp",

      "united republic of tanzania": "tz",

      // Add common adjective forms that might appear in recipe origins
      italian: "it",
      french: "fr",
      spanish: "es",
      german: "de",
      chinese: "cn",
      japanese: "jp",
      mexican: "mx",
      indian: "in",
      thai: "th",
      greek: "gr",
      turkish: "tr",
      lebanese: "lb",
      moroccan: "ma",
      brazilian: "br",
      peruvian: "pe",
      ethiopian: "et",
      korean: "kr",
      filipino: "ph",
      indonesian: "id",
      malaysian: "my",
      australian: "au",
      canadian: "ca",
      russian: "ru",
      polish: "pl",
      swedish: "se",
      norwegian: "no",
      danish: "dk",
      finnish: "fi",
      portuguese: "pt",
      belgian: "be",
      swiss: "ch",
      austrian: "at",
      hungarian: "hu",
      czech: "cz",
      egyptian: "eg",
      "south african": "za",
      nigerian: "ng",
      kenyan: "ke",
      argentinian: "ar",
      argentine: "ar",
      colombian: "co",
      chilean: "cl",
    }

    // Try to find the country code
    if (countryCodeMap[name]) {
      return countryCodeMap[name]
    }

    // If we can't find a mapping, return the original (this might not work with flagcdn)
    console.log(`No ISO code mapping found for: ${countryName}`)
    return name
  }

  const toggleView = () => {
    setIs3DView(!is3DView)
  }

  return (
    <div className="front-page">
      <nav className="navbar background">
        <div className="brand" onClick={handleBrandClick} style={{ cursor: "pointer" }}>
          NomadChef
          <img src={wisk_icon || "/placeholder.svg"} alt="Whisk Icon" className="whisk" />
        </div>
        <div className="list-items">
          <ul className="nav-list">
            <li>
              <button onClick={handlePastRecipesClick} className="nav-button">
                Past Recipes
              </button>
            </li>
            <li>
              <button onClick={handleChallengesClick} className="nav-button">
                Challenges
              </button>
            </li>
            <li>
              <button onClick={handleAccountClick} className="nav-button">
                Account
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-button logout-button">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <section className="section">
        <div className="map-and-recipes-container">
          <div
            className="map-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMapMouseLeave}
            ref={mapContainerRef}
          >
            <button onClick={toggleView} className="nav-button view-toggle">
              {is3DView ? "2D View" : "3D View"}
            </button>

            {is3DView ? (
              <Globe3D
                completedCountries={completedCountries}
                selectedCountry={selectedCountry}
                onCountryClick={handleCountryClick}
                onMouseLeave={handleMapMouseLeave}
              />
            ) : (
              <Map>
                <VectorMap
                  {...worldMap}
                  style={{ width: "100%", height: "100%" }}
                  checkedLayers={completedCountries}
                  layerProps={mapLayerProps}
                  currentLayers={completedCountries}
                  onMouseLeave={handleMapMouseLeave}
                />
              </Map>
            )}

            <div className="progress-container" onMouseEnter={handleMapMouseLeave}>
              <CustomProgressBar />
            </div>
          </div>

          {selectedCountry && selectedCountryList.length > 0 && (
            <div className="country-recipes-panel">
              <button className="close-country-recipes" onClick={handleCloseCountryRecipes}>
                ×
              </button>
              <div className="country-card">
                <h2>{selectedCountry}</h2>
                {console.log("Selected country:", selectedCountry)}
                <div className="country-info">
                  <div className="country-flag">
                    <img
                      src={`https://flagcdn.com/w320/${getCountryIsoCode(selectedCountry)}.png`}
                      alt={`${selectedCountry} flag`}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://via.placeholder.com/320x213?text=Flag+Not+Available"
                      }}
                    />
                  </div>
                  <div className="country-stats">
                    <p>
                      <strong>Recipes Completed:</strong> {selectedCountryList.length}
                    </p>
                    <p>
                      <strong>Region:</strong> {getCountryRegion(selectedCountry)}
                    </p>
                  </div>
                </div>
              </div>

              <h3>Recipes from {selectedCountry}</h3>
              <div className="country-recipes-list">
                {selectedCountryList.map((item, index) => (
                  <div
                    key={`recipe-${index}`}
                    className="country-recipe-card"
                    onClick={() => recipeClicked(item.recipeId)}
                  >
                    <SmallRecipeCard
                      image={item.recipe?.image || "No image available"}
                      name={item.recipe?.title || "Untitled Recipe"}
                      fallbackText="No image available"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <PromptBox />
      </section>
      <section className="section">
        <h1 className="section-heading-here">Recommended Recipes</h1>
        <div className="slider">
          <Carousel responsive={responsive}>{recommendedList}</Carousel>
        </div>
      </section>
      <section className="section">
        <h1>History</h1>
        <div className="slider">
          <Carousel responsive={responsive}>{historylist}</Carousel>
        </div>
      </section>
      <footer className="footer">
        <p className="text-footer">Copyright ©-All rights are reserved</p>
      </footer>
    </div>
  )
}

export default FrontPage

