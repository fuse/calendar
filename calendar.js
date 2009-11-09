/**
 * Calendar class, version 0.0.1 by Martin <martin@synbioz.com>
 *
 * Calendar is a class wich provide easy way to choose a date, it's also 
 * called datePicker.
 *
 * Please use Calendar by calling Calendar.getInstance, not new Calendar.
 * You normaly only need one calendar by page, even if you have multiple 
 * date to choose.
 */

Calendar = Class.create();

/* Statics methods */
Calendar.getInstance = function(e) {
	if(!Calendar.instance)
		Calendar.instance = new Calendar(e);
		
	Calendar.instance.setCaller(Event.element(e));		
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
	_template: new Template('#{year}/#{month}/#{day}'),							 
	
	initialize: function(e, date) {
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
			day: day < 10 ? ("0" + day) : day, 
			month: month < 10 ? ("0" + month) : month, 
			year: year
		});
	}, // getDateAsStr
	
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
	
	getTemplate: function() {
		return this._template;
	}, // getTemplate	
	
	setTemplate: function(template) {
		this._template = template;
	}, // setTemplate
	
	append: function() {
		$$("body").first().insert(this.getCalendar());
	}, // append
	
	buildCalendar: function() {
		var table 			= new Element("table", {"id": "calendar"});		
		var rowsNumber 		= this.getRowsNumber();
		var firstDayNumber 	= this.getFirstDayNumber();
		var monthLength 	= this.getMonthLength();
		var calendar		= this;
				
		// header
		var thead = new Element("tr", {"class": "header"});		
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
		
		thead.insert(col);
		thead.insert(new Element("td", {"colspan": "5"}).update(this.getMonthName() + " " + this.getYear()));

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
				
		thead.insert(col);
		table.insert(thead);		

		// days
		var thead = new Element("tr", {"class": "header"});
		for(var days = 0; days < 7; ++days) {
			thead.insert(new Element("td").update(this.getDaysNames()[days].substr(0, 1)));
		}
		table.insert(thead);

		// first line
		var tbody = new Element("tr");
		var index = 0;
		for(var colsNumber = 0; colsNumber < 7; ++colsNumber) {
			var col = new Element("td");
			if(colsNumber >= firstDayNumber) {
				col.update(++index);
				col.addClassName("valid");
				this.manageColumn(col, index);
			} else
				col.update("X");
					
			tbody.insert(col);
		}
		table.insert(tbody);
		
		// middle lines
		for(var index = 0; index < rowsNumber - 2; ++index) {
			var tbody = new Element("tr");
			for(var colsNumber = 0; colsNumber < 7; ++colsNumber) {
				var state = (7 - firstDayNumber) + (index * 7) + (colsNumber + 1);
				var col = new Element("td");
				col.addClassName("valid");				
				tbody.insert(col.update(state));
				this.manageColumn(col, state);
			}
			table.insert(tbody);
		}
		
		// last line
		var tbody = new Element("tr");
		var startAt = (7 - firstDayNumber) + (rowsNumber - 2) * 7 + 1;
		for(var colsNumber = 0; colsNumber < 7; ++colsNumber) {
			var col = new Element("td");
			if(startAt + colsNumber <= monthLength) {
				col.update(startAt + colsNumber);
				col.addClassName("valid");			
				this.manageColumn(col, (startAt + colsNumber));
			} else
				col.update("X");
				
			tbody.insert(col);
		}
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
		});
	}, // manageColumn
	
	position: function() {
		var coordinates = this.getCaller().cumulativeOffset();
		this.getCalendar().setStyle({
			"position"	: "absolute",
			"left"			: parseInt(coordinates.left + 32, 10) + "px",
			"top"				: parseInt(coordinates.top, 10) + "px"
		});	
	}, // position
	
	setDate: function(date) {
		this._date = date;
	} // setDate

}; // Calendar
