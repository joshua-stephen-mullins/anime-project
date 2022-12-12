'use strict';

$(document).ready(() => {
    onLoad();

    function onLoad() {
        fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKeyTMDP}`)
            .then(response => response.json())
            .then((response) => {
                console.log('Results', response);
                generateSmallCards(response, 5, '#trendingResults');
            })
            .catch(err => console.error(err));
        fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKeyTMDP}&language=en-US`)
            .then(response => response.json())
            .then((response) => {
                console.log('Results', response);
            })
            .catch(err => console.error(err));
    }

    function allSearch(input) {
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKeyTMDP}&language=en-US&query=${input}&include_adult=false`)
            .then(response => response.json())
            .then(response => console.log('Search Results', response))
            .catch(err => console.error(err));
    }

    $('#movieSearchButton').click(function (e) {
        e.preventDefault();
        allSearch($('#movieSearchInput').val());
    })

    function searchById(searchType, id) {
        fetch(`https://api.themoviedb.org/3/${searchType}/${id}?api_key=${apiKeyTMDP}&language=en-US`)
            .then(response => response.json())
            // .then(response => console.log('Results by id', response)
            .then((data) => {
                console.log(data);
                if (data.hasOwnProperty('title')) {
                    $(`#moreInfoTitle`).html(data.title)
                } else {
                    $(`#moreInfoTitle`).html(data.name)
                }
                $('#moreInfoPoster').attr('src', `https://image.tmdb.org/t/p/original/${data.poster_path}`);
                $('#moreInfoOverview').html(data.overview);
                if (data.hasOwnProperty('release_date')) {
                    $(`#moreInfoYear`).html("(" + data.release_date.slice(0, 4) + ")")
                } else {
                    $(`#moreInfoYear`).html("(" + data.last_air_date.slice(0, 4) + ")")
                }
                $('#moreInfoGenre').html('');
                for (let i = 0; i < data.genres.length; i++) {
                    if (i === (data.genres.length - 1)) {
                        $('#moreInfoGenre').append(`${data.genres[i].name}`)
                    } else {
                        $('#moreInfoGenre').append(data.genres[i].name + ', &nbsp;')
                    }
                }
                if (data.hasOwnProperty('runtime')) {
                    $('#moreInfoRuntime').html(toHoursAndMinutes(data.runtime))
                } else {
                    $('#moreInfoRuntime').html(toHoursAndMinutes(data.last_episode_to_air.runtime))
                }
                if (searchType === 'movie') {
                    fetch(`https://api.themoviedb.org/3/movie/${id}/release_dates?api_key=${apiKeyTMDP}`)
                        .then(response => response.json())
                        // .then(response => console.log('Results by id', response)
                        .then((data) => {
                            console.log(data);
                            data.results.forEach(function (country) {
                                if (country.iso_3166_1 === "US") {
                                    country.release_dates.forEach(function (result) {
                                        if (result.certification !== '') {
                                            $('#moreInfoRating').html(result.certification);
                                        }
                                    })
                                }
                            })
                        })
                } else {
                    fetch(`https://api.themoviedb.org/3/tv/${id}/content_ratings?api_key=${apiKeyTMDP}&language=en-US`)
                        .then(response => response.json())
                        // .then(response => console.log('Results by id', response)
                        .then((data) => {
                            console.log(data);
                            data.results.forEach(function (country) {
                                if (country.iso_3166_1 === "US") {
                                    $('#moreInfoRating').html(country.rating);
                                }
                            })
                        })
                }
            })
            .catch(err => console.error(err));
    }

    function generateSmallCards(showInfo, numberOfCards, container) {
        for (let i = 0; i < numberOfCards; i++) {
            $(container).append(`
                <div class="card text-white bg-primary mb-3 col-2" id="showCard${i}" data-type="${showInfo.results[i].media_type} data-showId="${showInfo.results[i].id}">
                    <div class="">
                        <button data-bs-toggle="modal" data-bs-target="#moreInfoModal"><img class="w-100 h-100" src="https://image.tmdb.org/t/p/original/${showInfo.results[i].poster_path}" alt="Poster"></button>
                    </div>
                    <div class="card-footer">
                        <h5><span id="resultTitle_${showInfo.results[i].id}"></span> <span class="text-muted" id="resultDate_${showInfo.results[i].id}"></span></h5>
                        <p><span id="previewGenre${i}"></span></p>
                        <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                          <input type="radio" class="btn-check " name="btnradio" id="btnradio1" autocomplete="off" checked="">
                          <label class="btn btn-outline-danger fs-3" for="btnradio1"><i class="fa-solid fa-fire"></i></label>
                          <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" checked="">
                          <label class="btn btn-outline-danger fs-3" for="btnradio2"><i class="fa-solid fa-eye"></i></label>
                        </div>
                    </div>
                </div>
            `);
            if (showInfo.results[i].hasOwnProperty('title')) {
                $(`#resultTitle_${showInfo.results[i].id}`).html(showInfo.results[i].title)
            } else {
                $(`#resultTitle_${showInfo.results[i].id}`).html(showInfo.results[i].name)
            }
            $(`#showCard${i}`).click(() => searchById(showInfo.results[i].media_type, showInfo.results[i].id));
            console.log(showInfo.results[i].release_date);
            if (showInfo.results[i].hasOwnProperty('release_date')) {
                $(`#resultDate_${showInfo.results[i].id}`).html("(" + showInfo.results[i].release_date.slice(0, 4) + ")")
            } else {
                $(`#resultDate_${showInfo.results[i].id}`).html("(" + showInfo.results[i].first_air_date.slice(0, 4) + ")")
            }
            for (let j = 0; j < showInfo.results[i].genre_ids.length; j++) {
                if (j === (showInfo.results[i].genre_ids.length - 1)) {
                    $('#previewGenre' + i).append(genreIdToText(showInfo.results[i].genre_ids[j]))
                } else {
                    $('#previewGenre' + i).append(genreIdToText(showInfo.results[i].genre_ids[j]) + ', &nbsp;')
                }
            }
        }
    }

    function toHoursAndMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        } else
            return ` ${minutes}m`;
    }

    function genreIdToText(id) {
        let genres = [
            {id: 28, name: 'Action'},
            {id: 12, name: 'Adventure'},
            {id: 16, name: 'Animation'},
            {id: 35, name: 'Comedy'},
            {id: 80, name: 'Crime'},
            {id: 99, name: 'Documentary'},
            {id: 18, name: 'Drama'},
            {id: 10751, name: 'Family'},
            {id: 14, name: 'Fantasy'},
            {id: 36, name: 'History'},
            {id: 27, name: 'Horror'},
            {id: 10402, name: 'Music'},
            {id: 9648, name: 'Mystery'},
            {id: 10749, name: 'Romance'},
            {id: 878, name: 'Science Fiction'},
            {id: 10770, name: 'TV Movie'},
            {id: 53, name: 'Thriller'},
            {id: 10752, name: 'War'},
            {id: 37, name: 'Western'},
            {id: 10759, name: 'Action & Adventure'},
            {id: 16, name: 'Animation'},
            {id: 35, name: 'Comedy'},
            {id: 80, name: 'Crime'},
            {id: 99, name: 'Documentary'},
            {id: 18, name: 'Drama'},
            {id: 10751, name: 'Family'},
            {id: 10762, name: 'Kids'},
            {id: 9648, name: 'Mystery'},
            {id: 10763, name: 'News'},
            {id: 10764, name: 'Reality'},
            {id: 10765, name: 'Sci-Fi & Fantasy'},
            {id: 10766, name: 'Soap'},
            {id: 10767, name: 'Talk'},
            {id: 10768, name: 'War & Politics'},
            {id: 37, name: 'Western'}
        ];
        for (let i = 0; i < genres.length; i++) {
            if (id === genres[i].id) {
                return genres[i].name;
            }
        }
    }
})
