/**
 * Calendar class, version 0.0.3 by Martin <martin@synbioz.com>
 *
 * Calendar is a class wich provide easy way to choose a date, it's also
 * called datePicker.
 *
 * Please use Calendar by calling Calendar.getInstance, not new Calendar.
 * You normaly only need one calendar by page, even if you have multiple
 * date to choose.
 *
 * Options allow you to view week number on the first column. You can also
 * specify callbacks which be called when a day is choosen.
 *
 * If you specify a rel="2010-08-04" on the img node for exemple, the picker
 * will be initialized with this date. You can also use / separator.
 */

// Add some extensions to date class.
$A(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).each(function(day, index) {
  Date.prototype["is_" + day] = function() { return this.getDay() == index + 1 }
});

Calendar = Class.create();
/* Statics methods */
Calendar.getInstance = function(e, options) {
  var node = Event.element(e);
  var strDate = node.readAttribute("rel");
  var date = new Date();
  if(strDate && strDate.match(/(\d+)(-|\/)(\d+)(-|\/)(\d+)/))
    date = new Date(RegExp.$1, RegExp.$3 - 1, RegExp.$5)

  if(!Calendar.instance)
    Calendar.instance = new Calendar(e, date, options);

  Calendar.instance.setCaller(node);
  Calendar.instance.setDate(date);

  Calendar.instance.position();
  return Calendar.instance;
};

/* Objects methods */
Calendar.prototype = {
  _calendar: null,
  _date: null,
  _caller: null,
  _daysNames: new Array(
              "Lundi",
              "Mardi",
              "Mercredi",
              "Jeudi",
              "Vendredi",
              "Samedi",
              "Dimanche"
             ),
  _monthsNames: new Array(
              "Janvier",
              "Février",
              "Mars",
              "Avril",
              "Mai",
              "Juin",
              "Juillet",
              "Aout",
              "Septembre",
              "Octobre",
              "Novembre",
              "Décembre"
              ),
  _monthsLengths: new Array(
                "31", "28", "31", "30", "31", "30",
                "31", "31", "30", "31", "30", "31"
               ),

  _options: $H({ weekNumbers: false }),
  _template: new Template('#{year}/#{month}/#{day}'),

  _callbacks: new Array(),

  initialize: function(e, date, options) {
    this.setOptions(options);
    this.setDate(date || new Date());
    this.setCalendar($('calendar') || this.buildCalendar());
  },

  /* Getters and setters */
  getCalendar: function() {
    return this._calendar;
  }, // getCalendar

  setCalendar: function(calendar) {
    this._calendar = calendar;
  }, // setCalendar

  getDate: function() {
    return this._date;
  }, // getDate

  getDateAsStr: function(day, month, year) {
    return this.getTemplate().evaluate({
      day:    this.strNumber(day),
      month:  this.strNumber(month),
      year:   year
    });
  }, // getDateAsStr

  strNumber: function(number) {
    if(isNaN(number)) return "";
    return number < 10 ? "0" + number : number
  }, // strNumber

  getDaysNames: function() {
    return this._daysNames;
  }, // getDaysNames

  getMonth: function() {
    return this.getDate().getMonth();
  }, // getMonth

  setMonth: function(month) {
    this.getDate().setMonth(month);
  }, // setMonth

  getMonthDay: function() {
    return this.getDate().getDate();
  }, // getDay

  setMonthDay: function(day) {
    this.getDate().setDate(day);
  }, // setDay

  getWeekDay: function() {
    return this.getDate().getDay();
  }, // getDay

  getYear: function() {
    return this.getDate().getFullYear();
  }, // getYear

  setYear: function(year) {
    this.getDate().setFullYear(year);
  }, // setYear

  getCaller: function() {
    return this._caller;
  }, // getCaller

  setCaller: function(caller) {
    this._caller = caller;
  }, // setCaller

  getMonthsNames: function() {
    return this._monthsNames;
  }, // getMonthsNames

  getMonthsLengths: function() {
    return this._monthsLengths;
  }, // getMonthsLength

  getOptions: function() {
    return this._options;
  }, // getOptions

  setOptions: function(options) {
    this._options.update($H(options));
  }, // setOptions

  getTemplate: function() {
    return this._template;
  }, // getTemplate

  setTemplate: function(template) {
    this._template = template;
  }, // setTemplate

  getCallbacks: function() {
    return this._callbacks;
  }, // getCallbacks

  setCallbacks: function(callbacks) {
    this._callbacks = callbacks;
  }, // setCallbacks

  addCallback: function(callback) {
    if("function" == typeof callback) {
      this.getCallbacks().push(callback);
      return true;
    }
    return false;
  }, // addCallback

  append: function() {
    $$("body").first().insert(this.getCalendar());
  }, // append

  buildCalendar: function() {
    var table           = new Element("table", {"id": "calendar"});
    var rowsNumber      = this.getRowsNumber();
    var firstDayNumber  = this.getFirstDayNumber();
    var monthLength     = this.getMonthLength();
    var calendar        = this;
    var default_colspan = this.getOptions().get("weekNumbers") ? 6 : 5;
    var weeksNumber     = this.getWeeksNumberOfYear(calendar.getYear());
    var prevWeeksNumber = this.getWeeksNumberOfYear(calendar.getYear() - 1);

    // header
    var thead = new Element("thead");
    var row = new Element("tr", {"class": "header"});
    // previous
    var col = new Element("td", {"class": "laquo"}).update("&laquo;");
    col.observe('click', function(e) {
      var previousCalendar = $('calendar');
      var month = calendar.getMonth();

      if(1 == month) {
        calendar.setYear(calendar.getYear() - 1);
        calendar.setMonth(12);
      } else
        calendar.setMonth(month - 1);

      calendar.setCalendar(calendar.buildCalendar());
      calendar.position();
      calendar.append();
      previousCalendar.remove();
    });

    row.insert(col);
    row.insert(new Element("td", { "colspan": default_colspan }).update(this.getMonthName() + " " + this.getYear()));

    // next
    var col = new Element("td", {"class": "raquo"}).update("&raquo;");
    col.observe('click', function(e) {
      var previousCalendar = $('calendar');
      var month = calendar.getMonth();

      if(11 == month) {
        calendar.setYear(calendar.getYear() + 1);
        calendar.setMonth(0);
      } else
        calendar.setMonth(month + 1);

      calendar.setCalendar(calendar.buildCalendar());
      calendar.position();
      calendar.append();
      previousCalendar.remove();
    });

    row.insert(col);
    thead.insert(row);

    // days
    var row = new Element("tr", {"class": "header"});

    if(this.getOptions().get("weekNumbers"))
      row.insert(new Element("td"));

    for(var days = 0; days < 7; ++days) {
      row.insert(new Element("td").update(this.getDaysNames()[days].substr(0, 1)));
    }
    thead.insert(row);
    table.insert(thead);

    // first line
    var tbody = new Element("tbody");
    var row = new Element("tr");
    var index = 0;

    if(this.getOptions().get("weekNumbers")) {
      var week = this.getWeeksNumberFromDate(new Date(this.getYear(), this.getMonth(), 1));
      row.insert(new Element("td", { "class": "week_number" }).update(this.strNumber(week)));
    }

    for(var colsNumber = 0; colsNumber < 7; ++colsNumber) {
      var col = new Element("td");
      if(colsNumber >= firstDayNumber) {
        col.update(++index);
        col.addClassName("valid");
        this.manageColumn(col, index);
      } else
        col.update("X");

      row.insert(col);
    }
    tbody.insert(row);

    if(week == prevWeeksNumber)
      week = 0;

    // middle lines
    for(var index = 0; index < rowsNumber - 2; ++index) {
      var row = new Element("tr");

      if(this.getOptions().get("weekNumbers"))
        row.insert(new Element("td", { "class": "week_number" }).update(this.strNumber(++week)));

      for(var colsNumber = 0; colsNumber < 7; ++colsNumber) {
        var state = (7 - firstDayNumber) + (index * 7) + (colsNumber + 1);
        var col = new Element("td");
        col.addClassName("valid");
        row.insert(col.update(state));
        this.manageColumn(col, state);
      }
      tbody.insert(row);
    }

    // last line
    var row = new Element("tr");
    if(week == weeksNumber)
      week = 0

    if(this.getOptions().get("weekNumbers"))
      row.insert(new Element("td", { "class": "week_number" }).update(this.strNumber(++week)));

    var startAt = (7 - firstDayNumber) + (rowsNumber - 2) * 7 + 1;
    for(var colsNumber = 0; colsNumber < 7; ++colsNumber) {
      var col = new Element("td");
      if(startAt + colsNumber <= monthLength) {
        col.update(startAt + colsNumber);
        col.addClassName("valid");
        this.manageColumn(col, (startAt + colsNumber));
      } else
        col.update("X");

      row.insert(col);
    }
    tbody.insert(row)
    table.insert(tbody);

    return table;
  }, // buildCalendar

  display: function() {
    var calendar = this.getCalendar();
    if(calendar) {
      this.position();
      if(!$('calendar'))
        this.append();
      else
        calendar.visible() ? calendar.hide() : calendar.show();
    }
  }, // display

  // Return the position of the day in the year, 1st january is day 1, 1 february is day 32…
  getDayNumberOfYear: function(date) {
    var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.round(((date - firstDayOfYear) / (1000 * 86400))) + 1;
  },

  getFirstDayNumber: function() {
    var date = this.getDate();
    this.setMonthDay(1);
    var index = (this.getWeekDay() + 6) % 7;
    this.setDate(date);
    return index;
  }, // getFirstDayNumber

  getMonthName: function() {
    var index = this.getMonth();
    if(!isNaN(index) && 11 >= index && 0 <= index)
      return this.getMonthsNames()[index];
    return "";
  }, // getMonthName

  getMonthLength: function() {
    var index = this.getMonth();

    if(!isNaN(index) && 11 >= index && 0 <= index)
      return (this.isLeapYear() && 1 == index) ? 29 : this.getMonthsLengths()[index];
    return 0;
  }, // getMonthLength

  /*
   * Get the day number of the date (Ex: 1st february is the 32th day of the year), add missing day
   * before the 1st january and missing day after the date to have complete weeks. Then divide by 7, it
   * returns the week number of the day.
   */
  getWeeksNumberFromDate: function(date) {
    var dayNumber = this.getDayNumberOfYear(date);
    var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    // Ex: year 2009 start a thursday, add 3 days (monday to wednesday)
    var dayBeforeYearStart = (firstDayOfYear.getDay() + 6) % 7;
    // Add missing day to complete the week, 1 october 2009 is a thursday, add 3 days (friday to sunday)
    var dayForWeekToFinish = 6 - ((date.getDay() + 6) % 7);

    var weekNumber = ((dayNumber + dayBeforeYearStart + dayForWeekToFinish) / 7)

    if(!this.firstDaysContainsThursday(firstDayOfYear))
      weekNumber--

    return (weekNumber == 0) ?
      this.getWeeksNumberFromDate(new Date(firstDayOfYear.getFullYear() - 1, 11, 31)) :
      weekNumber;
  }, // getWeeksNumberFromDate

  /*
   * Takes the first day of the year as param.
   */
  firstDaysContainsThursday: function(date) {
    return date.getDay() >= 1 && date.getDay() <= 4;
  }, // firstDaysContainsThursday

  /*
   * Date which starts a thursday have 53 weeks. Leap year have 53 weeks if they start thursday or wednesday.
   */
  getWeeksNumberOfYear: function(year) {
    var date = new Date(year, 0, 1);
    if(this.isLeapYear())
      return (date.is_wednesday() || date.is_thursday()) ? 53 : 52;
    else
      return date.is_thursday() ? 53 : 52;
  }, // getWeeksNumberOfYear

  getPreviousInput: function() {
    if("INPUT" == this.getCaller().nodeName) return this.getCaller();
    return this.getCaller().previous("input[type='text']") || this.getCaller().up().down("input[type='text']");
  }, // getPreviousInput

  getRowsNumber: function() {
    return(Math.ceil((this.getMonthLength() - (7 - this.getFirstDayNumber())) / 7) + 1);
  }, // getRowsNumber

  isLeapYear: function() {
    var year = this.getYear();
    return ((0 == year % 4 && 0 != year % 100) || (0 == year % 400));
  }, // isLeapYear

  manageColumn: function(col, day) {
    col.observe('mouseover', function(e) {
      col.addClassName("over");
    });

    col.observe('mouseout', function(e) {
      col.removeClassName("over");
    });

    var object = this;
    col.observe('click', function(e) {
      var input = object.getPreviousInput();
      if(input) {
        input.value = object.getDateAsStr(day, object.getMonth() + 1, object.getYear());
        object.display();
      }

      object.getCallbacks().each(function(callback) {
        if ("function" == typeof callback) callback(value, object);
      });

    });
  }, // manageColumn

  position: function() {
    var coordinates = this.getCaller().cumulativeOffset();
    this.getCalendar().setStyle({
      "position"  : "absolute",
      "left"      : parseInt(coordinates.left + 32, 10) + "px",
      "top"       : parseInt(coordinates.top, 10) + "px"
    });
  }, // position

  setDate: function(date) {
    this._date = date;
  } // setDate
}; // Calendar