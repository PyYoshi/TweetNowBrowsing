'use strict';

class Utility {

    /**
     * @return {String}
     */
    static nowUTCString() {
      return new Date().toUTCString();
    }
}

export default Utility;
