class Location {

  constructor(name) {
    this.name = name;
  }

  static take_search() {
    let search_dict = {};
    if(window.location.search) {
      let search = window.location.search.substring(1).split('&');
      for(let i in search) {
        let pair = search[i].split('=');
        search_dict[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
    }
    return search_dict;
  }

  static get_search(search_dict) {
    let search = new URLSearchParams();
    for(let key in search_dict) {
      search.set(key, search_dict[key]);
    }
    return search.toString();
  }

  load() {
    let search_dict = Location.take_search();
    if(search_dict.hasOwnProperty(this.name)) {
      return parseInt(search_dict[this.name]);
    }
    return false;
  }

  save(id) {
    let search_dict = Location.take_search();
    search_dict[this.name] = id.toString();
    history.replaceState(null, '', window.location.pathname+'?'+Location.get_search(search_dict));
  }

}

export {
  Location
};
