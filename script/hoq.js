/**
 * Gets called after the document has finished loading.
 */
$(document).ready(function() {
    $("#btn_authorize").button({disabled: true});

    // init HoQ
    HouseOfQuality.init();

    $("#btn_undo").button({
        icons: {
            primary: "ui-icon-arrowreturnthick-1-w"
        },
        text: false,
        disabled: true
    }).click(function(event) {
        HouseOfQuality.undo();
    });

    $("#btn_redo").button({
        icons: {
            primary: "ui-icon-arrowreturnthick-1-e"
        },
        text: false,
        disabled: true
    }).click(function(event) {
        HouseOfQuality.redo();
    });

    $("#btn_adduserreq").button().click(function(event) {
        HouseOfQuality.addUserRequirement();
    });

    $("#btn_addfuncreq").button().click(function(event) {
        HouseOfQuality.addFunctionalRequirement();
    });

    $("#btn_addproduct").button().click(function(event) {
        HouseOfQuality.addProduct();
    });

    $("#btn_users").button({
        icons: {
            primary: "ui-icon-person",
            secondary: "ui-icon-triangle-1-s"
        }
    }).click(function(event) {
        if ($(this).is(".active")) {
            console.log("off");
            $(this).removeClass("active");

            $(this).button({icons: {
                    primary: "ui-icon-person",
                    secondary: "ui-icon-triangle-1-s"
                }});

            HouseOfQuality.showUserBox(false);
        } else {
            console.log("on");
            $(this).addClass("active");

            $(this).button({icons: {
                    primary: "ui-icon-person",
                    secondary: "ui-icon-triangle-1-n"
                }});

            HouseOfQuality.showUserBox(true);
        }
    });
});


/**
 * The main House of Quality app class.
 * 
 * @type Object
 */
var HouseOfQuality = HouseOfQuality || {};

/**
 * Initializes the HouseOfQualityApp and connects to Google Drive.
 * 
 * @returns {undefined}
 */
HouseOfQuality.init = function() {
    // start the realtime session
    HouseOfQuality.startRealtime();

    this._addEditableListeners();
};

/**
 * Adds listeners to all editable cells of the diagram. Normally executed after new
 * rows have been added.
 * 
 * @returns {undefined}
 */
HouseOfQuality._addEditableListeners = function() {
    var self = this;

    // make the weights editable
    $(".hq_matrix_cell_weight").editable(function(value, settings) {
        HouseOfQuality._onCellChangedUserRequirementWeight(value, settings, $(this));
        return(value);
    },
            {
                type: 'text',
                tooltip: "Click here to change the value",
                onblur: "submit",
                placeholder: ""
            }
    );

    // make the customer requirements editable
    $(".hq_matrix_cell_custreq").editable(function(value, settings) {
        HouseOfQuality._onCellChangedUserRequirementName(value, settings, $(this));
        // return the entered text as output
        return(value);
    },
            {
                type: 'text',
                tooltip: "Click here to change the value",
                onblur: "submit"
            }
    );

    // make the functional requirements editable
    $(".hq_matrix_cell_funcreq div").editable(function(value, settings) {
        HouseOfQuality._onCellChangedFuncRequirementName(value, settings, $(this));
        return(value);
    },
            {
                type: 'text',
                tooltip: "Click here to change the value",
                onblur: "submit"
            }
    );

    // make the functional requirements' target editable
    $(".hq_matrix_cell_target div").editable(function(value, settings) {
        HouseOfQuality._onCellChangedFuncRequirementTarget(value, settings, $(this));
        return(value);
    },
            {
                type: 'text',
                tooltip: "Click here to change the value",
                onblur: "submit",
                placeholder: "none"
            }
    );

    // make the product headers editable
    $(".hq_matrix_cell_product div").editable(function(value, settings) {
        HouseOfQuality._onCellChangedProductName(value, settings, $(this));
        return(value);
    },
            {
                type: 'text',
                tooltip: "Click here to change the value",
                onblur: "submit"
            }
    );

    // make the relationship cells editable
    $(".hq_matrix_cell_relationship").editable(function(value, settings) {
        return HouseOfQuality._onCellRelationshipChanged(value, settings, $(this));
    },
            {
                type: 'select',
                data: function() {
                    return self._cellValuesRelationship(arguments);
                },
                tooltip: "Click here to change the value",
                onblur: "submit",
                placeholder: ""
            }
    );

    $(".hq_matrix_cell_relationship").mouseenter(HouseOfQuality._onCellRelationshipMouseenter);
    $(".hq_matrix_cell_relationship").mouseleave(HouseOfQuality._onCellRelationshipMouseleave);

    // make the rating cells editable
    $(".hq_matrix_cell_rating").editable(function(value, settings) {
        return HouseOfQuality._onCellRatingChanged(value, settings, $(this));
    },
            {
                type: 'select',
                data: function() {
                    return self._cellValuesRating(arguments);
                },
                tooltip: "Click here to change the value",
                onblur: "submit",
                placeholder: ""
            }
    );

    // make the improvement cells editable
    $(".hq_matrix_cell_improvement").editable(function(value, settings) {
        return HouseOfQuality._onCellImprovementChanged(value, settings, $(this));
    },
            {
                type: 'select',
                data: function() {
                    return self._cellValuesImprovement(arguments);
                },
                tooltip: "Click here to change the value",
                onblur: "submit",
                placeholder: ""
            }
    );

    // make the difficulty cells editable
    $(".hq_matrix_cell_difficulty").editable(function(value, settings) {
        return HouseOfQuality._onCellDifficultyChanged(value, settings, $(this));
    },
            {
                type: 'select',
                data: function() {
                    return self._cellValuesDifficulty(arguments);
                },
                tooltip: "Click here to change the value",
                onblur: "submit",
                placeholder: ""
            }
    );

    // make the dependancy fields editable
    $(".hq_roof .hq_roof_values div").editable(function(value, settings) {
        return HouseOfQuality._onCellDependancyChanged(value, settings, $(this));
    },
            {
                type: 'select',
                data: function() {
                    return self._cellValuesDependancy(arguments);
                },
                tooltip: "Click here to change the value",
                onblur: "submit",
                placeholder: ""
            }
    );

    $(".hq_roof .hq_roof_values div").mouseenter(HouseOfQuality._onCellDependancyMouseenter);
    $(".hq_roof .hq_roof_values div").mouseleave(HouseOfQuality._onCellDependancyMouseleave);


    $(".hq_matrix_cell_rownr").mouseenter(HouseOfQuality._onRowCustomerRequirementMouseenter);
    $(".hq_matrix_cell_rownr").mouseleave(HouseOfQuality._onRowCustomerRequirementMouseleave);

    $(".hq_matrix_cell_colnr").mouseenter(HouseOfQuality._onColumnFunctionalRequirementMouseenter);
    $(".hq_matrix_cell_colnr").mouseleave(HouseOfQuality._onColumnFunctionalRequirementMouseleave);
};

/**
 * Draws an HTML5 canvas as "roof" of the diagram.
 * 
 * @param {integer} width the width (in pixel) that is available for the correlation fields.
 * @param {integer} sections the number of sections (= functional requirements).
 * @returns {undefined}
 */
HouseOfQuality._drawCorrelationMatrix = function(width, sections) {
    // get a reference to the canvas element
    var canvas = document.getElementById("hq_roof_canvas");
    canvas.width = width;
    canvas.height = width / 2;

    if (canvas && canvas.getContext) {
        var context = canvas.getContext("2d");
        if (context) {
            // let's draw!

            // set the style properties.
            context.strokeStyle = "#000";
            context.lineWidth = 2;

            var leap = width / sections;
            var step;

            for (var i = 0; i < sections; i++) {
                context.beginPath();

                step = i * (leap / 2);

                // draw from left to bottom right
                context.moveTo((width / 2) - step, step);
                context.lineTo(width - i * leap, width / 2);
                context.stroke();

                // now draw from right to bottom left
                context.moveTo((width / 2) + step, step);
                context.lineTo(i * leap, width / 2);
                context.stroke();

                context.closePath();
            }
        }
    }
};

/**
 * Inserts a correlation matrix ("roof matrix") into the House of Quality.
 * 
 * Removes any existing correlation fields from the roof of the House of Quality
 * and adds and positions new fields according to the parameters.
 * 
 * Existing correlation values are preset.
 * 
 * @param {integer} width the width (in pixel) that is available for the correlation fields.
 * @param {integer} sections the number of sections (= functional requirements).
 * @returns {boolean} true if the fields could be added to the roof.
 */
HouseOfQuality.setCorrelationMatrix = function(width, sections) {
    // draw roof
    HouseOfQuality._drawCorrelationMatrix(width, sections);

    var boxSize = 20;
    var colWidth, rowLeft;

    // remove all current fields
    $(".hq_roof .hq_roof_values > div").remove();

    var funcReqArray = HouseOfQuality._funcRequirements.asArray();

    // loop for rows
    for (var row = 0; row < (sections - 1); row++) {
        colWidth = boxSize * (row + 1) + boxSize * row; // sizes of box + sizes of spaces in-between
        rowLeft = width / 2 - colWidth / 2;

        // loop for columns
        for (var column = 0; column < row + 1; column++) {
            var a = funcReqArray[column];
            var b = funcReqArray[funcReqArray.length - (row + 1 - column)];
            var uuidA = (a.uuid < b.uuid) ? a.uuid : b.uuid;
            var uuidB = (a.uuid > b.uuid) ? a.uuid : b.uuid;
            var div = $("<div>");
            div.attr("data-uuid-a", uuidA);
            div.attr("data-uuid-b", uuidB);
            div.css("left", rowLeft + column * (boxSize * 2)).css("top", (boxSize / 2) + row * boxSize).appendTo(".hq_roof .hq_roof_values");

            var funcReq = HouseOfQuality.getFunctionalRequirement(uuidA);
            if (funcReq.dependancies.has(uuidB)) {
                div.text(HouseOfQuality._getDependancySymbol(funcReq.dependancies.get(uuidB)));
            }
        }
    }

    return true;
};

/**
 * Draws an HTML5 canvas as products diagram.
 * 
 * @returns {undefined}
 */
HouseOfQuality._drawProductsDiagram = function() {
    var diagram = document.getElementById("hq_products_diagram");
    var colors = ["#7BD671", "#CC71D6", "#D69971", "#9E5B2E"];
    var style = ["diamond", "square", "triangle", "x", "circle"];
    var currentStyle = -1;
    var currentColor = -1;

    var context = diagram.getContext("2d");
    if (context) {
        // let's draw!

        // one loop for every product
        var productsArray = HouseOfQuality._products.asArray();
        for (var i = 0; i < productsArray.length; i++) {
            var product = productsArray[i];
            currentStyle = ++currentStyle % style.length;
            currentColor = ++currentColor % colors.length;
            context.strokeStyle = colors[currentColor];
            context.fillStyle = colors[currentColor];

            var lastPos = null;

            // loop through user requirements
            var userReqArray = HouseOfQuality._userRequirements.asArray();
            for (var j = 0; j < userReqArray.length; j++) {
                var userReq = userReqArray[j];

                // check if product has a rating
                var rating = (userReq.ratings.has(product.uuid)) ? userReq.ratings.get(product.uuid) : "-1";
                rating = parseInt(rating);

                if (rating > -1) {
                    // calculate position
                    pos = [parseInt(((180 / 6) / 2) + (rating * (180 / 6))), parseInt((j * 30)) + (30 / 2)];

                    context.beginPath();
                    context.arc(pos[0], pos[1], 2, 0, Math.PI * 2, true);
                    context.closePath();
                    context.fill();

                    // draw line from lastPos to this pos
                    if (lastPos !== null) {
                        context.moveTo(lastPos[0], lastPos[1]);
                        context.lineTo(pos[0], pos[1]);
                        context.stroke();
                    }
                    lastPos = pos;
                } else {
                    lastPos = null;
                }
            }
        }
    }
};

HouseOfQuality.updateProductsDiagram = function() {
    var diagram = document.getElementById("hq_products_diagram");
    diagram.width = 180;
    diagram.height = HouseOfQuality._userRequirements.length * 30;

    $("#hq_products_diagram").position({my: "left top", at: "left bottom", of: ".hq_matrix_cell_ratinglabel:first"});
    HouseOfQuality._drawProductsDiagram();
};

/**
 * Called by Jeditable after a user requirement's name cell has been changed. Saves the value of the field into the
 * data model of the app.
 * 
 * @param {String} value the entered value.
 * @param {type} settings some Jeditable parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {undefined} 
 */
HouseOfQuality._onCellChangedUserRequirementName = function(value, settings, source) {
    var uuid = source.closest("tr").data("uuid");
    var userReq = HouseOfQuality.getUserRequirement(uuid);

    userReq.name = value;
};

/**
 * Called by Jeditable after a user requirement's weight cell has been changed. Saves the value of the field into the
 * data model of the app. Starts recalculation of dependent cells.
 * 
 * @param {String} value the entered value.
 * @param {type} settings some Jeditable parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {undefined} 
 */
HouseOfQuality._onCellChangedUserRequirementWeight = function(value, settings, source) {
    var uuid = source.closest("tr").data("uuid");
    var userReq = HouseOfQuality.getUserRequirement(uuid);

    userReq.weight = value;

    HouseOfQuality._calcUserRequirementRelativeWeight();
    HouseOfQuality._calcFuncRequirementRelWeights();
};

/**
 * Called by Jeditable after a functional requirement's name cell has been changed. Saves the value of the field into the
 * data model of the app.
 * 
 * @param {String} value the entered value.
 * @param {type} settings some Jeditable parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {undefined} 
 */
HouseOfQuality._onCellChangedFuncRequirementName = function(value, settings, source) {
    var uuid = source.data("uuid_funcreq");
    var funcReq = HouseOfQuality.getFunctionalRequirement(uuid);

    funcReq.name = value;
};

/**
 * Called by Jeditable after a functional requirement's target cell has been changed. Saves the value of the field into the
 * data model of the app.
 * 
 * @param {String} value the entered value.
 * @param {type} settings some Jeditable parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {undefined} 
 */
HouseOfQuality._onCellChangedFuncRequirementTarget = function(value, settings, source) {
    var uuid = source.data("uuid_funcreq");
    var funcReq = HouseOfQuality.getFunctionalRequirement(uuid);

    funcReq.target = value;
};

HouseOfQuality._onCellChangedProductName = function(value, settings, source) {
    var uuid = source.data("uuid");
    var product = HouseOfQuality.getProduct(uuid);

    product.name = value;
};

// RELATIONSHIP CELLS

/**
 * Returns the list of possible values of a relationship cell and the current selection.
 * The currently selected value is included with the key "selected".
 * 
 * @param {Array} args this comes from jeditable. The first index contains the currently selected value.
 * The second index contains an object with event information.
 * @returns {String} a JSON string with an object containing the possible values of the relationship cell.
 */
HouseOfQuality._cellValuesRelationship = function(args) {
    var selection = "-1";
    if (args[0] === "Θ") {
        selection = "9";
    } else if (args[0] === "Ο") {
        selection = "3";
    } else if (args[0] === "▲") {
        selection = "1";
    }

    return '{"-1":"neutral", "9":"Θ strong relationship", "3":"Ο moderate relationship", "1":"▲ weak relationship", "selected": "' + selection + '"}';
};

/**
 * Called when the value of a relationship cell has been edited. May trigger further action like saving
 * the result on a server.
 * 
 * @param {String} value the entered value.
 * @param {type} settings comes from jeditable, contains event parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {String} the textual content that should be added to the cell.
 */
HouseOfQuality._onCellRelationshipChanged = function(value, settings, source) {
    var symbol = HouseOfQuality._getRelationshipSymbol(value);

    // sync it
    var uuidUserReq = source.closest("tr").data("uuid");
    var uuidFuncReq = source.data("uuid_funcreq");
    var userReq = HouseOfQuality.getUserRequirement(uuidUserReq);
    userReq.relationships.set(uuidFuncReq, value);

    // set max relationship value cell
    HouseOfQuality._calcUserRequirementMaxRelationshipValue(uuidUserReq);
    HouseOfQuality._calcFuncRequirementMaxRelationshipValue(uuidFuncReq);
    HouseOfQuality._calcFuncRequirementRelWeights();

    return symbol;
};

/**
 * Gets the symbol to a specific relationship integer value.
 * 
 * @param {integer} the integer code of a specific value.
 * @returns {String} the symbol to the integer code.
 */
HouseOfQuality._getRelationshipSymbol = function(value) {
    var symbol = "";
    if (value == 9) {
        symbol = "Θ";
    } else if (value == 3) {
        symbol = "Ο";
    } else if (value == 1) {
        symbol = "▲";
    }

    return symbol;
};

/** RATING CELLS **/

/**
 * Returns the list of possible values of a rating cell and the current selection.
 * The currently selected value is included with the key "selected".
 * 
 * @param {Array} args this comes from jeditable. The first index contains the currently selected value.
 * The second index contains an object with event information.
 * @returns {String} a JSON string with an object containing the possible values of the rating cell.
 */
HouseOfQuality._cellValuesRating = function(args) {
    var selection = (args[0] === "") ? "-1" : args[0];

    return '{"-1":"", "0":"0", "1":"1", "2":"2", "3":"3", "4":"4", "5":"5", "selected": "' + selection + '"}';
};

/**
 * Called when the value of a rating cell has been edited. May trigger further action like saving
 * the result on a server.
 * 
 * @param {String} value the entered value.
 * @param {type} settings comes from jeditable, contains event parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {String} the textual content that should be added to the cell.
 */
HouseOfQuality._onCellRatingChanged = function(value, settings, source) {
    var rating = (value === "-1") ? "" : value;

    // sync it
    var uuidUserReq = source.closest("tr").data("uuid");
    var uuidProduct = source.data("uuid_product");
    var userReq = HouseOfQuality.getUserRequirement(uuidUserReq);
    userReq.ratings.set(uuidProduct, value);

    // update diagram
    HouseOfQuality.updateProductsDiagram();

    return rating;
};

/** Difficulty CELLS **/

/**
 * Returns the list of possible values of a difficulty cell and the current selection.
 * The currently selected value is included with the key "selected".
 * 
 * @param {Array} args this comes from jeditable. The first index contains the currently selected value.
 * The second index contains an object with event information.
 * @returns {String} a JSON string with an object containing the possible values of the difficulty cell.
 */
HouseOfQuality._cellValuesDifficulty = function(args) {
    var selection = (args[0] === "") ? "-1" : args[0];

    return '{"-1":"", "0":"0", "1":"1", "2":"2", "3":"3", "4":"4", "5":"5", "6":"6", "7":"7", "8":"8", "9":"9", "10":"10", "selected": "' + selection + '"}';
};

/**
 * Called when the value of a difficulty cell has been edited. May trigger further action like saving
 * the result on a server.
 * 
 * @param {type} value the entered value.
 * @param {type} settings comes from jeditable, contains event parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {String} the textual content that should be added to the cell.
 */
HouseOfQuality._onCellDifficultyChanged = function(value, settings, source) {
    var difficulty = (value === "-1") ? "" : value;

    // sync it
    var uuidFuncReq = source.data("uuid_funcreq");
    var funcReq = HouseOfQuality.getFunctionalRequirement(uuidFuncReq);
    funcReq.difficulty = value;

    return difficulty;
};

/** IMPROVEMENT DIRECTION CELLS **/

/**
 * Returns the list of possible values of an improvement direction cell and the current selection.
 * The currently selected value is included with the key "selected".
 * 
 * @param {Array} args this comes from jeditable. The first index contains the currently selected value.
 * The second index contains an object with event information.
 * @returns {String} a JSON string with an object containing the possible values of the improvement direction cell.
 */
HouseOfQuality._cellValuesImprovement = function(args) {
    var selection = "-1";
    if (args[0] === "▼") {
        selection = "1";
    } else if (args[0] === "▲") {
        selection = "2";
    } else if (args[0] === "x") {
        selection = "3";
    }

    return '{"-1":"neutral", "1":"▼ objective is to minimize", "2":"▲ objective is to maximize", "3":"x objective is to hit target", "selected": "' + selection + '"}';
};

/**
 * Called when the value of an improvement direction cell has been edited. May trigger further action like saving
 * the result on a server.
 * 
 * @param {type} value the entered value.
 * @param {type} settings comes from jeditable, contains event parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {String} the textual content that should be added to the cell.
 */
HouseOfQuality._onCellImprovementChanged = function(value, settings, source) {
    var symbol = HouseOfQuality._getImprovementSymbol(value);

    // save it to model
    var uuid = source.data("uuid_funcreq");
    var funcReq = HouseOfQuality.getFunctionalRequirement(uuid);
    funcReq.improvementDirection = value;

    return symbol;
};

/**
 * Gets the symbol to a specific improvement integer value.
 * 
 * @param {integer} value the integer code of a specific value.
 * @returns {String} the symbol to the integer code.
 */
HouseOfQuality._getImprovementSymbol = function(value) {
    var symbol = "";
    if (value == 1) {
        symbol = "▼";
    } else if (value == 2) {
        symbol = "▲";
    } else if (value == 3) {
        symbol = "x";
    }

    return symbol;
}

/** ROOF DEPENDANCY CELLS **/

/**
 * Returns the list of possible values of a dependancy cell and the current selection.
 * The currently selected value is included with the key "selected".
 * 
 * @param {Array} args this comes from jeditable. The first index contains the currently selected value.
 * The second index contains an object with event information.
 * @returns {String} a JSON string with an object containing the possible values of the dependancy cell.
 */
HouseOfQuality._cellValuesDependancy = function(args) {
    var selection = "-1";
    if (args[0] === "┼┼") {
        selection = "1";
    } else if (args[0] === "┼") {
        selection = "2";
    } else if (args[0] === "▬") {
        selection = "3";
    } else if (args[0] === "▼") {
        selection = "4";
    }

    return '{"-1":"neutral", "1":"┼┼ strong positive correlation", "2":"┼ positive correlation", "3":"▬ negative correlation", "4":"▼ strong negative correlation", "selected": "' + selection + '"}';
};

/**
 * Called when the value of a dependancy cell has been edited. May trigger further action like saving
 * the result on a server.
 * 
 * @param {type} value the entered value.
 * @param {type} settings comes from jeditable, contains event parameters.
 * @param {type} source the element the Jeditable input type was embedded in.
 * @returns {String} the textual content that should be added to the cell.
 */
HouseOfQuality._onCellDependancyChanged = function(value, settings, source) {
    var symbol = HouseOfQuality._getDependancySymbol(value);

    // sync
    var uuidA = source.data("uuid-a");
    var uuidB = source.data("uuid-b");
    var funcReq = HouseOfQuality.getFunctionalRequirement(uuidA);
    funcReq.dependancies.set(uuidB, value);

    return symbol;
};

/**
 * Gets the symbol to a specific dependancy integer value.
 * 
 * @param {integer} value the integer code of a specific value.
 * @returns {String} the symbol to the integer code.
 */
HouseOfQuality._getDependancySymbol = function(value) {
    var symbol = "";
    if (value == 1) {
        symbol = "┼┼";
    } else if (value == 2) {
        symbol = "┼";
    } else if (value == 3) {
        symbol = "▬";
    } else if (value == 4) {
        symbol = "▼";
    }

    return symbol;
};

HouseOfQuality._onCellRelationshipMouseenter = function(event) {
    // hightlight funcreq
    var uuidFuncReq = $(this).data("uuid_funcreq");
    $("div[data-uuid_funcreq='" + uuidFuncReq + "']").parent().addClass("highlight");
    // highlight userreq
    $(this).closest("tr").find(".hq_matrix_cell_custreq").addClass("highlight");
};

HouseOfQuality._onCellRelationshipMouseleave = function(event) {
    // remove hightlight funcreq
    var uuidFuncReq = $(this).data("uuid_funcreq");
    $("div[data-uuid_funcreq='" + uuidFuncReq + "']").parent().removeClass("highlight");
    // remove highlight userreq
    $(this).closest("tr").find(".hq_matrix_cell_custreq").removeClass("highlight");
};

HouseOfQuality._onCellDependancyMouseenter = function(event) {
    // hightlight funcreqs
    var uuidA = $(this).data("uuid-a");
    var uuidB = $(this).data("uuid-b");
    $("div[data-uuid_funcreq='" + uuidA + "']").parent().addClass("highlight");
    $("div[data-uuid_funcreq='" + uuidB + "']").parent().addClass("highlight");
};

HouseOfQuality._onCellDependancyMouseleave = function(event) {
    // remove hightlight funcreqs
    var uuidA = $(this).data("uuid-a");
    var uuidB = $(this).data("uuid-b");
    $("div[data-uuid_funcreq='" + uuidA + "']").parent().removeClass("highlight");
    $("div[data-uuid_funcreq='" + uuidB + "']").parent().removeClass("highlight");
};

HouseOfQuality._onRowCustomerRequirementMouseenter = function(event) {
    // remove the row number
    event.delegateTarget.innerText = "";

    // add delete link
    $("<a>", {
        text: "X",
        title: "Remove this customer requirement",
        href: "#",
        click: HouseOfQuality._onRemoveUserRequirement
        }).appendTo(event.delegateTarget);
};

HouseOfQuality._onRowCustomerRequirementMouseleave = function(event) {
    var row = $(".hq_matrix_cell_rownr").index(event.delegateTarget) + 1;
    event.delegateTarget.innerText = row;
};

HouseOfQuality._onColumnFunctionalRequirementMouseenter = function(event) {
    // remove the row number
    event.delegateTarget.innerText = "";

    // add delete link
    $("<a>", {
        text: "X",
        title: "Remove this functional requirement",
        href: "#",
        click: HouseOfQuality._onRemoveFunctionalRequirement
    }).appendTo(event.delegateTarget);
};

HouseOfQuality._onColumnFunctionalRequirementMouseleave = function(event) {
    var column = $(".hq_matrix_cell_colnr").index(event.delegateTarget) + 1;
    event.delegateTarget.innerText = column;
};

/**
 * Adds a new user requirement to the model which in turn calls another method to add it to the UI.
 * 
 * @returns {undefined}
 */
HouseOfQuality.addUserRequirement = function() {
    // create collaborative object
    var uuid = guid();
    var userReq = HouseOfQuality.createUserRequirement();
    userReq.uuid = uuid;
    userReq.name = "Requirement";
    HouseOfQuality._userRequirements.push(userReq);
    //// create row
    //HouseOfQuality.setUserRequirementRow(userReq);

    // update products diagram
    HouseOfQuality.updateProductsDiagram();
};

/**
 * Adds a new or changes an existing row of the UI representation of a user requirement.
 * 
 * @param {type} userReq a UserRequirement object.
 * @returns {undefined}
 */
HouseOfQuality.setUserRequirementRow = function(userReq) {
    // count how many rows we have already...
    var countUserReq = $(".hq_customerreq").length;

    var reqelem = '<tr data-uuid="' + userReq.uuid + '" class="hq_matrix_row hq_customerreq">' +
            '<td class="hq_matrix_cell_rownr">' + (countUserReq + 1) + '</td>' +
            '<td class="hq_matrix_cellheader_maxrelvalue"></td>' +
            '<td class="hq_matrix_cellheader_relweight"></td>' +
            '<td class="hq_matrix_cell_weight">' + (userReq.weight ? userReq.weight : '') + '</td>' +
            '<td class="hq_matrix_cell_custreq" id="' + userReq.uuid + '.name">' + userReq.name + '</td>';

    // add as many relationship cells as we have functional requirements...
    var funcReqArray = HouseOfQuality._funcRequirements.asArray();
    var countFuncReqs = funcReqArray.length;
    var funcReq;
    for (var i = 0; i < countFuncReqs; i++) {
        funcReq = funcReqArray[i];
        var value = (userReq.relationships.has(funcReq.uuid)) ? HouseOfQuality._getRelationshipSymbol(userReq.relationships.get(funcReq.uuid)) : "";
        reqelem += '<td data-uuid_funcreq="' + funcReq.uuid + '" class="hq_matrix_cell_relationship">' + value + '</td>';
    }

    // add as many product cells as we have products...
    var productsArray = HouseOfQuality._products.asArray();
    var countProducts = productsArray.length;
    var product;
    for (var i = 0; i < countProducts; i++) {
        product = productsArray[i];
        var rating = (userReq.ratings.has(product.uuid)) ? userReq.ratings.get(product.uuid) : "";
        rating = (rating === "-1") ? "" : rating;
        reqelem += '<td data-uuid_product="' + product.uuid + '" class="hq_matrix_cell_rating">' + rating + '</td>';
    }

    reqelem += '<td class="hq_matrix_row_products" colspan="6"></td></tr>';

    if ($(".hq_customerreq").exists()) {
        // insert after last customer requirement
        $(".hq_customerreq:last").after(reqelem);
    } else {
        // insert after header
        $(".hq_matrix_header").after(reqelem);
    }

    HouseOfQuality._addEditableListeners();
};

/**
 * Called when clicking the 'X' in a customer requirement row.
 *
 * @param event
 * @private
 */
HouseOfQuality._onRemoveUserRequirement = function(event) {
    var uuid = event.delegateTarget.parentNode.parentNode.dataset.uuid;
    $(function() {
        $("#dialog-confirm").dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                "Delete item": function() {
                    $(this).dialog("close");
                    HouseOfQuality.removeUserRequirement(uuid);
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            }
        });
    });
};

HouseOfQuality.removeUserRequirement = function(userReq) {
    var userReqArray = HouseOfQuality._userRequirements.asArray();

    $.each(userReqArray, function(index, value) {
        if (value.uuid === userReq) {
            HouseOfQuality._userRequirements.remove(index);
            return false;
        }
    });

    // update products diagram
    HouseOfQuality.updateProductsDiagram();
};

HouseOfQuality.addFunctionalRequirement = function() {
    // create collaborative object
    var uuid = guid();
    var funcReq = HouseOfQuality.createFunctionalRequirement();
    funcReq.uuid = uuid;
    funcReq.name = "Functional Requirement";
    HouseOfQuality._funcRequirements.push(funcReq);
    //// create row
    //HouseOfQuality.setFunctionalRequirementColumn(funcReq);

    // update diagram
    HouseOfQuality.updateProductsDiagram();
};

HouseOfQuality.setFunctionalRequirementColumn = function(funcReq) {
    // needs to add cells to every row and recalculate the overall width of the HoQ

    // count how many columns we have already...
    var countFuncReq = $(".hq_matrix_cell_colnr").length;

    // add column #
    var columnNrElem = '<td data-uuid="' + funcReq.uuid + '" class="hq_matrix_cell_colnr">' + (countFuncReq + 1) + '</td>';
    if ($(".hq_matrix_cell_colnr").exists()) {
        // insert after last column # cell
        $(".hq_matrix_cell_colnr:last").after(columnNrElem);
    } else {
        // insert after header
        $(".hq_matrix_header_colnr_label").after(columnNrElem);
    }

    // add improvement direction
    var imprElem = '<td data-uuid_funcreq="' + funcReq.uuid + '" class="hq_matrix_cell_improvement">' + HouseOfQuality._getImprovementSymbol(funcReq.improvementDirection) + '</td>';
    if ($(".hq_matrix_cell_improvement").exists()) {
        // insert after last improvement cell
        $(".hq_matrix_cell_improvement:last").after(imprElem);
    } else {
        // insert after header
        $(".hq_matrix_cell_improvement_label").after(imprElem);
    }

    // add demanded quality (name)
    var qualElem = '<td class="hq_matrix_cell_funcreq"><div data-uuid_funcreq="' + funcReq.uuid + '">' + funcReq.name + '</div></td>';
    if ($(".hq_matrix_cell_funcreq").exists()) {
        // insert after last functional requirement cell
        $(".hq_matrix_cell_funcreq:last").after(qualElem);
    } else {
        // insert after header
        $(".hq_matrix_header_custreq").after(qualElem);
    }

    // add relationship matrix cells
    var relElem = '<td data-uuid_funcreq="' + funcReq.uuid + '" class="hq_matrix_cell_relationship"></td>';
    if ($(".hq_matrix_cell_relationship").exists()) {
        // insert after last customer requirement
        $(".hq_customerreq").find(".hq_matrix_cell_relationship:last").after(relElem);
    } else {
        // insert after header
        $(".hq_customerreq").find(".hq_matrix_cell_custreq").after(relElem);
    }

    // add target cell
    var targetElem = '<td class="hq_matrix_cell_target"><div data-uuid_funcreq="' + funcReq.uuid + '">' + (funcReq.target ? funcReq.target : '') + '</div></td>';
    if ($(".hq_matrix_cell_target").exists()) {
        // insert after last target cell
        $(".hq_matrix_cell_target:last").after(targetElem);
    } else {
        // insert after header
        $(".hq_matrix_cell_target_label").after(targetElem);
    }

    // add difficulty cell
    var difficultyElem = '<td data-uuid_funcreq="' + funcReq.uuid + '" class="hq_matrix_cell_difficulty">' + ((funcReq.difficulty && (funcReq.difficulty > -1)) ? funcReq.difficulty : '') + '</td>';
    if ($(".hq_matrix_cell_difficulty").exists()) {
        // insert after last target cell
        $(".hq_matrix_cell_difficulty:last").after(difficultyElem);
    } else {
        // insert after header
        $(".hq_matrix_cell_difficulty_label").after(difficultyElem);
    }

    // add max relationship cell
    var maxrelElem = '<td data-uuid_funcreq="' + funcReq.uuid + '" class="hq_matrix_cell_maxrelvalue"></td>';
    if ($(".hq_matrix_cell_maxrelvalue").exists()) {
        // insert after last max rel cell
        $(".hq_matrix_cell_maxrelvalue:last").after(maxrelElem);
    } else {
        // insert after header
        $(".hq_matrix_cell_maxrelvalue_label").after(maxrelElem);
    }

    // add weight cell
    var weightElem = '<td data-uuid_funcreq="' + funcReq.uuid + '" class="hq_matrix_cell_importance"></td>';
    if ($(".hq_matrix_cell_importance").exists()) {
        // insert after last weight cell
        $(".hq_matrix_cell_importance:last").after(weightElem);
    } else {
        // insert after header
        $(".hq_matrix_cell_importance_label").after(weightElem);
    }

    // add relative weight cell
    var relweightElem = '<td data-uuid_funcreq="' + funcReq.uuid + '" class="hq_matrix_cell_relweight"></td>';
    if ($(".hq_matrix_cell_relweight").exists()) {
        // insert after last relative weight cell
        $(".hq_matrix_cell_relweight:last").after(relweightElem);
    } else {
        // insert after header
        $(".hq_matrix_cell_relweight_label").after(relweightElem);
    }

    //TODO: only redraw the roof after batch process has finished
    // calculate colspan of roof and adjust its width
    var totalFuncReq = HouseOfQuality._funcRequirements.length;
    $(".hq_roof").attr("colspan", totalFuncReq);
    $(".hq_roof").css("width", (totalFuncReq * 40) + "px");

    // draw roof
    HouseOfQuality.setCorrelationMatrix(totalFuncReq * 40, totalFuncReq);

    // adjust HoQ overall width
    $(".hq_house").css("width", HouseOfQuality.width() + "px");

    HouseOfQuality._addEditableListeners();
};

HouseOfQuality._onRemoveFunctionalRequirement = function(event) {
    var uuid = event.delegateTarget.parentNode.dataset.uuid;
    $(function() {
        $("#dialog-confirm").dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                "Delete item": function() {
                    $(this).dialog("close");
                    HouseOfQuality.removeFunctionalRequirement(uuid);
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            }
        });
    });
};

HouseOfQuality.removeFunctionalRequirement = function(funcReq) {
    var userReqArray = HouseOfQuality._funcRequirements.asArray();

    $.each(userReqArray, function(index, value) {
        if (value.uuid === funcReq) {
            HouseOfQuality._funcRequirements.remove(index);
            return false;
        }
    });
};

HouseOfQuality.addProduct = function() {
    // create collaborative object
    var uuid = guid();
    // begin compound operation, otherwise undo/redo operation is activated for creation of product
    HouseOfQuality.model.beginCompoundOperation();
    var product = HouseOfQuality.createProduct(uuid, "Product");
    HouseOfQuality._products.push(product);
    HouseOfQuality.model.endCompoundOperation();
};

HouseOfQuality.setProductColumn = function(product) {
    // needs to add product cells to every row and recalculate the overall width of the HoQ

    // add header
    var headerElem = '<td class="hq_matrix_cell_product"><div data-uuid="' + product.uuid + '">' + product.name + '</div></td>';
    if ($(".hq_matrix_cell_product").exists()) {
        // insert after last customer requirement
        $(".hq_matrix_cell_product:last").after(headerElem);
    } else if ($(".hq_matrix_cell_funcreq").exists()) {
        // insert after last customer requirement
        $(".hq_matrix_cell_funcreq:last").after(headerElem);
    } else {
        // insert after header
        $(".hq_matrix_header_custreq").after(headerElem);
    }

    // add product cell in each row
    var ratingElem = '<td data-uuid_product="' + product.uuid + '" class="hq_matrix_cell_rating"></td>';
    if ($(".hq_matrix_cell_rating").exists()) {
        // insert after last rating cell
        $(".hq_customerreq").find(".hq_matrix_cell_rating:last").after(ratingElem);
    } else if ($(".hq_matrix_cell_relationship").exists()) {
        // insert after last customer requirement
        $(".hq_customerreq").find(".hq_matrix_cell_relationship:last").after(ratingElem);
    } else {
        // insert after header
        $(".hq_customerreq").find(".hq_matrix_cell_custreq").after(ratingElem);
    }

    // adjust HoQ overall width
    $(".hq_house").css("width", HouseOfQuality.width() + "px");

    // adjust colspan
    $(".hq_remainder_right").attr("colspan", HouseOfQuality._products.length + 6);

    // adjust CSS style attribute of first row for compatibility reasons...
    $(".hq_remainder_right:first").css("width", (HouseOfQuality._products.length * 30 + 180) + "px");

    HouseOfQuality._addEditableListeners();
    
    // update diagram
    HouseOfQuality.updateProductsDiagram();
};

HouseOfQuality.removeProduct = function(product) {
    // TODO: remove from data
};

/**
 * Returns the calculated width of the House of Quality based on the number of functional
 * and customer requirements.
 * 
 * @returns {Number} the required width of the House of Quality in pixel.
 */
HouseOfQuality.width = function() {
    var width = 430; // fields on the left

    // add width of functional requirements
    width += HouseOfQuality._funcRequirements.length * 40;

    //add width of product ratings
    width += HouseOfQuality._products.length * 30;
    width += 180; // product rating plot

    return width;
};


/** CELL CALCULATIONS **/

/**
 * Calculates all the relative weights and updates the respective cells.
 * 
 * @returns {undefined}
 */
HouseOfQuality._calcUserRequirementRelativeWeight = function() {
    var weights = {};
    var sumWeights = 0;
    var userReqArray = HouseOfQuality._userRequirements.asArray();
    // first calculate the weight sum
    for (var i = 0; i < userReqArray.length; i++) {
        var weight = parseFloat(userReqArray[i].weight);
        if (!isNaN(weight)) {
            sumWeights += weight;
        }
    }

    // now calculate the weight for each row
    for (i = 0; i < userReqArray.length; i++) {
        var userReq = userReqArray[i];
        var relWeight = "";
        var weight = parseFloat(userReq.weight);
        if (!isNaN(weight)) {
            relWeight = (weight / sumWeights) * 100;
            weights[userReq.uuid] = relWeight;
            relWeight = Math.round(relWeight * 10) / 10;
            relWeight += "%";
        }
        // update cell
        $("tr[data-uuid='" + userReq.uuid + "'] .hq_matrix_cellheader_relweight").text(relWeight);
    }

    return weights;
};

/**
 * Goes through the relationships to functional requirements and selects the highest values. Then updates
 * the respective cell.
 * 
 * @param {type} uuid
 * @returns {undefined}
 */
HouseOfQuality._calcUserRequirementMaxRelationshipValue = function(uuid) {
    var userReq = HouseOfQuality.getUserRequirement(uuid);
    var relationshipValues = userReq.relationships.values();
    var maxRel = -1;
    for (var i = 0; i < relationshipValues.length; i++) {
        maxRel = (relationshipValues[i] > maxRel) ? relationshipValues[i] : maxRel;
    }

    // update cell
    $("tr[data-uuid='" + uuid + "'] .hq_matrix_cellheader_maxrelvalue").text((maxRel < 0) ? "" : maxRel);
};

HouseOfQuality._calcFuncRequirementMaxRelationshipValue = function(uuid) {
    var maxRel = -1;
    var userReqArray = HouseOfQuality._userRequirements.asArray();
    for (var i = 0; i < userReqArray.length; i++) {
        var userReq = userReqArray[i];

        if (userReq.relationships.has(uuid)) {
            maxRel = (userReq.relationships.get(uuid) > maxRel) ? userReq.relationships.get(uuid) : maxRel;
        }
    }

    // update cell
    $(".hq_matrix_cell_maxrelvalue[data-uuid_funcreq='" + uuid + "']").text((maxRel < 0) ? "" : maxRel);
};

HouseOfQuality._calcFuncRequirementWeights = function(userReqWeights, uuidFuncReq) {
    var sumWeights = 0;
    var userReqArray = HouseOfQuality._userRequirements.asArray();
    for (var i = 0; i < userReqArray.length; i++) {
        var userReq = userReqArray[i];
        if (userReqWeights[userReq.uuid]) {
            if (userReq.relationships.has(uuidFuncReq) && (userReq.relationships.get(uuidFuncReq) > -1)) {
                sumWeights += userReqWeights[userReq.uuid] * userReq.relationships.get(uuidFuncReq);
            }
        }
    }

    // update cell
    $(".hq_matrix_cell_importance[data-uuid_funcreq='" + uuidFuncReq + "']").text((sumWeights > 0) ? (Math.round(sumWeights * 10) / 10) : "");

    return sumWeights;
};

HouseOfQuality._calcFuncRequirementRelWeights = function() {
    var userReqWeights = HouseOfQuality._calcUserRequirementRelativeWeight();
    var funcReqWeights = {};
    var sumWeights = 0;
    var funcReqArray = HouseOfQuality._funcRequirements.asArray();
    // first calculate the weight sum
    for (var i = 0; i < funcReqArray.length; i++) {
        var funcReq = funcReqArray[i];
        funcReqWeights[funcReq.uuid] = HouseOfQuality._calcFuncRequirementWeights(userReqWeights, funcReq.uuid);
        sumWeights += funcReqWeights[funcReq.uuid];
    }

    // now calculate the weight for each column
    for (i = 0; i < funcReqArray.length; i++) {
        var weight = "";
        var funcReq = funcReqArray[i];
        if ((sumWeights > 0) && funcReqWeights[funcReq.uuid]) {
            weight = Math.round((funcReqWeights[funcReq.uuid] / sumWeights) * 1000) / 10;
            weight += "%";
        }
        // update cell
        $(".hq_matrix_cell_relweight[data-uuid_funcreq='" + funcReq.uuid + "']").text(weight);
    }
};


/** DRIVE REALTIME HOOKS **/

HouseOfQuality.UserRequirement = function() {
};

HouseOfQuality.createUserRequirement = function() {
    return HouseOfQuality.model.create(HouseOfQuality.UserRequirement);
};

HouseOfQuality.getUserRequirement = function(uuid) {
    var userReqArray = HouseOfQuality._userRequirements.asArray();
    var userReq;
    for (var i = 0; i < userReqArray.length; i++) {
        userReq = userReqArray[i];
        if (userReq.uuid === uuid) {
            return userReq;
        }
    }
    return;
};

HouseOfQuality.FunctionalRequirement = function() {
};

HouseOfQuality.createFunctionalRequirement = function() {
    return HouseOfQuality.model.create(HouseOfQuality.FunctionalRequirement);
};

HouseOfQuality.getFunctionalRequirement = function(uuid) {
    var funcReqArray = HouseOfQuality._funcRequirements.asArray();
    var funcReq;
    for (var i = 0; i < funcReqArray.length; i++) {
        funcReq = funcReqArray[i];
        if (funcReq.uuid === uuid) {
            return funcReq;
        }
    }
    return;
};

HouseOfQuality.Product = function() {
};

HouseOfQuality.createProduct = function(uuid, name) {
    return HouseOfQuality.model.create(HouseOfQuality.Product, uuid, name);
};

HouseOfQuality.getProduct = function(uuid) {
    var productsArray = HouseOfQuality._products.asArray();
    var product;
    for (var i = 0; i < productsArray.length; i++) {
        product = productsArray[i];
        if (product.uuid === uuid) {
            return product;
        }
    }
    return;
};

HouseOfQuality.registerTypes = function() {
    // UserRequirement
    gapi.drive.realtime.custom.registerType(HouseOfQuality.UserRequirement, "UserRequirement");
    HouseOfQuality.UserRequirement.prototype.uuid = gapi.drive.realtime.custom.collaborativeField("uuid");
    HouseOfQuality.UserRequirement.prototype.name = gapi.drive.realtime.custom.collaborativeField("name");
    HouseOfQuality.UserRequirement.prototype.weight = gapi.drive.realtime.custom.collaborativeField("weight");
    HouseOfQuality.UserRequirement.prototype.relationships = gapi.drive.realtime.custom.collaborativeField("relationships");
    HouseOfQuality.UserRequirement.prototype.ratings = gapi.drive.realtime.custom.collaborativeField("ratings");
    // initialize relationships and ratings fields
    gapi.drive.realtime.custom.setInitializer(HouseOfQuality.UserRequirement, function() {
        var model = gapi.drive.realtime.custom.getModel(this);
        this.relationships = model.createMap();
        this.ratings = model.createMap();
    });

    // FunctionalRequirement
    gapi.drive.realtime.custom.registerType(HouseOfQuality.FunctionalRequirement, "FunctionalRequirement");
    HouseOfQuality.FunctionalRequirement.prototype.uuid = gapi.drive.realtime.custom.collaborativeField("uuid");
    HouseOfQuality.FunctionalRequirement.prototype.name = gapi.drive.realtime.custom.collaborativeField("name");
    HouseOfQuality.FunctionalRequirement.prototype.improvementDirection = gapi.drive.realtime.custom.collaborativeField("improvementDirection");
    HouseOfQuality.FunctionalRequirement.prototype.target = gapi.drive.realtime.custom.collaborativeField("target");
    HouseOfQuality.FunctionalRequirement.prototype.difficulty = gapi.drive.realtime.custom.collaborativeField("difficulty");
    HouseOfQuality.FunctionalRequirement.prototype.dependancies = gapi.drive.realtime.custom.collaborativeField("dependancies");
    // initialize dependancies
    gapi.drive.realtime.custom.setInitializer(HouseOfQuality.FunctionalRequirement, function() {
        var model = gapi.drive.realtime.custom.getModel(this);
        this.dependancies = model.createMap();
    });

    // Product
    gapi.drive.realtime.custom.registerType(HouseOfQuality.Product, "Product");
    HouseOfQuality.Product.prototype.uuid = gapi.drive.realtime.custom.collaborativeField("uuid");
    HouseOfQuality.Product.prototype.name = gapi.drive.realtime.custom.collaborativeField("name");
    // set initializer
    gapi.drive.realtime.custom.setInitializer(HouseOfQuality.Product, function(uuid, name) {
        this.uuid = uuid;
        this.name = name;
    });
};

/**
 * This function is called the first time that the Realtime model is created
 * for a file. This function should be used to initialize any values of the
 * model. In this case, we just create the single string model that will be
 * used to control our text box. The string has a starting value of 'Hello
 * Realtime World!', and is named 'text'.
 * @param model {gapi.drive.realtime.Model} the Realtime root model object.
 */
HouseOfQuality.initializeModel = function(model) {
    HouseOfQuality.model = model;

    model.getRoot().set("userRequirements", model.createList());
    model.getRoot().set("funcRequirements", model.createList());
    model.getRoot().set("products", model.createList());

    HouseOfQuality._userRequirements = model.getRoot().get('userRequirements');
    HouseOfQuality._funcRequirements = model.getRoot().get('funcRequirements');
    HouseOfQuality._products = model.getRoot().get('products');

//    // create some dummy fields...
//    for (var i=0;i<4;i++) {
//        HouseOfQuality.addFunctionalRequirement();
//    }
//    for (var j=0;j<3;j++) {
//        HouseOfQuality.addUserRequirement();
//    }
};

HouseOfQuality.getCollaboratorById = function(userId) {
    var collaborators = HouseOfQuality.doc.getCollaborators();
    var collaborator;
    $.each(collaborators, function(i, val) {
        if (val.userId === userId) {
            collaborator = val;
        }
    });
    return collaborator;
};

HouseOfQuality._updateUserCount = function() {
    var collaborators = HouseOfQuality.doc.getCollaborators();
    var userIds = new Array();
    $.each(collaborators, function(index, value) {
        if (-1 === jQuery.inArray(value.userId, userIds)) {
            userIds.push(value.userId);
        }
    });
    $("#btn_users").button({label: userIds.length});
};

HouseOfQuality.showUserBox = function(show) {
    if (show) {
        // enable user list
        var collaborators = HouseOfQuality.doc.getCollaborators();
        $("#lyr_user_list").html("");
        var list = $("<ul>");
        var userIds = new Array();
        $.each(collaborators, function(index, value) {
            // check if user was already displayed
            if (-1 === jQuery.inArray(value.userId, userIds)) {
                userIds.push(value.userId);
                var user = $("<li><div style=\"background-color:" + value.color + "\"></div> <img src=\"" + value.photoUrl + "\" /> " + value.displayName + "</li>");
                list.append(user);
            }
        });
        $("#lyr_user_list").append(list);

        $("#lyr_user_list").show("drop", {direction: "right"}, 500);
    } else {
        // disable user list
        $("#lyr_user_list").hide("drop", {direction: "right"}, 500);
    }
};

HouseOfQuality._onUndoRedoStateChanged = function(e) {
    $("#btn_undo").button({
        disabled: !e.canUndo
    });

    $("#btn_redo").button({
        disabled: !e.canRedo
    });
};

HouseOfQuality.undo = function() {
    if (HouseOfQuality.model.canUndo) {
        HouseOfQuality.model.undo();
    }
};

HouseOfQuality.redo = function() {
    if (HouseOfQuality.model.canRedo) {
        HouseOfQuality.model.redo();
    }
};

/**
 * This function is called when the Realtime file has been loaded. It should
 * be used to initialize any user interface components and event handlers
 * depending on the Realtime model. In this case, create a text control binder
 * and bind it to our string model that we created in initializeModel.
 *
 * @param doc {gapi.drive.realtime.Document} the Realtime document.
 */
HouseOfQuality.onFileLoaded = function(doc) {
    HouseOfQuality.doc = doc;
    HouseOfQuality.model = doc.getModel();

    // set undo/redo listener
    HouseOfQuality.model.addEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, HouseOfQuality._onUndoRedoStateChanged);

    // update count of collaborators
    HouseOfQuality._updateUserCount();
    // listen to collaborator events
    doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, HouseOfQuality._updateUserCount);
    doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, HouseOfQuality._updateUserCount);

    // bind model
    HouseOfQuality._userRequirements = doc.getModel().getRoot().get('userRequirements');
    HouseOfQuality._funcRequirements = doc.getModel().getRoot().get('funcRequirements');
    HouseOfQuality._products = doc.getModel().getRoot().get('products');

    // add listeners
    HouseOfQuality._userRequirements.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, HouseOfQuality._userReqValuesAdded);
    HouseOfQuality._userRequirements.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, HouseOfQuality._userReqValuesRemoved);
    HouseOfQuality._funcRequirements.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, HouseOfQuality._funcReqValuesAdded);
    HouseOfQuality._funcRequirements.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, HouseOfQuality._funcReqValuesRemoved);
    HouseOfQuality._products.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, HouseOfQuality._productValuesAdded);
    HouseOfQuality._products.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, HouseOfQuality._productValuesRemoved);

    // create DOM elements according to collaborative data model
    // add functional requirements first, as no userReq rows are existing yet
    var funcReqArray = HouseOfQuality._funcRequirements.asArray();
    for (var i = 0; i < funcReqArray.length; i++) {
        HouseOfQuality.setFunctionalRequirementColumn(funcReqArray[i]);

        funcReqArray[i].addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, HouseOfQuality._funcReqValueChanged);
        // add listener for funcReq relationships
        funcReqArray[i].dependancies.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (function(uuid) {
            return function(e) {
                HouseOfQuality._funcReqDependanciesValueChanged(e, uuid);
            };
        })(funcReqArray[i].uuid));

        HouseOfQuality._calcFuncRequirementMaxRelationshipValue(funcReqArray[i].uuid);
    }

    // add products
    var productsArray = HouseOfQuality._products.asArray();
    for (var i = 0; i < productsArray.length; i++) {
        productsArray[i].addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, HouseOfQuality._productValueChanged);
        HouseOfQuality.setProductColumn(productsArray[i]);
    }

    // user requirements
    var userReqArray = HouseOfQuality._userRequirements.asArray();
    for (var i = 0; i < userReqArray.length; i++) {
        var userReq = userReqArray[i];
        userReq.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, HouseOfQuality._userReqValueChanged);
        // add listener for funcReq relationships
        userReq.relationships.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (function(uuid) {
            return function(e) {
                HouseOfQuality._userReqRelationshipsValueChanged(e, uuid);
            };
        })(userReq.uuid));
        // add listener for product ratings
        userReq.ratings.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (function(uuid) {
            return function(e) {
                HouseOfQuality._userReqRatingsValueChanged(e, uuid);
            };
        })(userReq.uuid));
        HouseOfQuality.setUserRequirementRow(userReq);

        // set max relationship value cell
        HouseOfQuality._calcUserRequirementMaxRelationshipValue(userReq.uuid);
    }

    // update fields
    HouseOfQuality._calcFuncRequirementRelWeights();

    // draw products diagram
    HouseOfQuality.updateProductsDiagram();

    // disable splashscreen
    $("#splashscreen").css("display", "none");
};

HouseOfQuality.startRealtime = function() {
    /**
     * Options for the Realtime loader.
     */
    var realtimeOptions = {
        /**
         * Client ID from the APIs Console.
         */
        clientId: '495508132650.apps.googleusercontent.com',
        /**
         * The ID of the button to click to authorize. Must be a DOM element ID.
         */
        authButtonElementId: 'btn_authorize',
        /**
         * Function to be called when a Realtime model is created for the first time.
         */
        initializeModel: HouseOfQuality.initializeModel,
        /**
         * Autocreate files right after auth automatically.
         */
        autoCreate: true,
        /**
         * Autocreate files right after auth automatically.
         */
        defaultTitle: "New House of Quality Diagram",
        /**
         * Function to be called every time a Realtime file is loaded.
         */
        onFileLoaded: HouseOfQuality.onFileLoaded,
        /**
         * Function that gets called after the authorization and before the initialization.
         * Registers all custom collaborative types.
         */
        registerTypes: HouseOfQuality.registerTypes
    };

    var realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
    realtimeLoader.start();
};

/** LISTENER UserRequirements **/

HouseOfQuality._userReqValuesAdded = function(e) {
    var userReqArray = HouseOfQuality._userRequirements.asArray();
    for (var i = 0; i < userReqArray.length; i++) {
        var userReq = userReqArray[i];
        // check if uuid exists in DOM
        if (!($("[data-uuid='" + userReq.uuid + "']").exists())) {
            HouseOfQuality.setUserRequirementRow(userReq);
            userReq.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, HouseOfQuality._userReqValueChanged);
            // add listener for funcReqs
            userReq.relationships.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (function(uuid) {
                return function(e) {
                    HouseOfQuality._userReqRelationshipsValueChanged(e, uuid);
                };
            })(userReq.uuid));
            // add listener for product ratings
            userReq.ratings.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (function(uuid) {
                return function(e) {
                    HouseOfQuality._userReqRatingsValueChanged(e, uuid);
                };
            })(userReq.uuid));

            // calculate fields
            HouseOfQuality._calcUserRequirementRelativeWeight();
            // set max relationship value cell
            HouseOfQuality._calcUserRequirementMaxRelationshipValue(userReq.uuid);

            var relationships = userReq.relationships.keys();
            for (var key = 0; key < relationships.length; key++) {
                HouseOfQuality._calcFuncRequirementMaxRelationshipValue(relationships[key]);
            }
        }
    }
    HouseOfQuality._calcFuncRequirementRelWeights();
};

HouseOfQuality._userReqValuesRemoved = function(e) {
    jQuery.each(e.values, function(index, userReq) {
        // awareness highlight
        var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";

        if (!e.isLocal) {
            $("tr[data-uuid='" + userReq.uuid + "']").effect('highlight', {color: color}, 2000, function() {
                $(this).fadeOut('fast', function() {
                    $(this).remove();

                    // update row numbers
                    var row = 1;
                    $('.hq_matrix_cell_rownr').each(function(i, obj) {
                        obj.innerText = row++;
                    });
                });
            });
        } else {
            $("tr[data-uuid='" + userReq.uuid + "']").fadeOut('fast', function() {
                $(this).remove();

                // update row numbers
                var row = 1;
                $('.hq_matrix_cell_rownr').each(function(i, obj) {
                    obj.innerText = row++;
                });
            });
        }
    });

    HouseOfQuality.updateProductsDiagram();
    // calculate all funcRelMaxRelationship values
    // loop through functional requirements
    var funcReqArray = HouseOfQuality._funcRequirements.asArray();
    for (var j = 0; j < funcReqArray.length; j++) {
        var funcReq = funcReqArray[j];
        HouseOfQuality._calcFuncRequirementMaxRelationshipValue(funcReq.uuid);
    }
    HouseOfQuality._calcFuncRequirementRelWeights();
    // calculate relative weight
    HouseOfQuality._calcUserRequirementRelativeWeight();
};

HouseOfQuality._userReqValueChanged = function(e) {
    // awareness highlight
    var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";

    if (e.property === "name") {
        var name = e.newValue;
        if (name === "") {
            name = "Click to edit";
        }
        $("tr[data-uuid='" + e.target.uuid + "'] .hq_matrix_cell_custreq").text(name);
        if (!e.isLocal) {
            $("tr[data-uuid='" + e.target.uuid + "'] .hq_matrix_cell_custreq").effect("highlight", {color: color}, 2000);
        }
    } else if (e.property === "weight") {
        var value = (e.newValue === null) ? "" : e.newValue;
        $("tr[data-uuid='" + e.target.uuid + "'] .hq_matrix_cell_weight").text(value);
        if (!e.isLocal) {
            $("tr[data-uuid='" + e.target.uuid + "'] .hq_matrix_cell_weight").effect("highlight", {color: color}, 2000);
        }
        HouseOfQuality._calcUserRequirementRelativeWeight();
        HouseOfQuality._calcFuncRequirementRelWeights();
    }
};

/**
 * 
 * @param {type} e
 * @param {type} uuid the UUID of the user requirement.
 * @returns {undefined}
 */
HouseOfQuality._userReqRelationshipsValueChanged = function(e, uuid) {
    $("tr[data-uuid='" + uuid + "'] .hq_matrix_cell_relationship[data-uuid_funcreq='" + e.property + "']").text(HouseOfQuality._getRelationshipSymbol(e.newValue));

    if (!e.isLocal) {
        // awareness highlight
        var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";
        $("tr[data-uuid='" + uuid + "'] .hq_matrix_cell_relationship[data-uuid_funcreq='" + e.property + "']").effect("highlight", {color: color}, 2000);
    }
    // set max relationship value cell
    HouseOfQuality._calcUserRequirementMaxRelationshipValue(uuid);

    HouseOfQuality._calcFuncRequirementMaxRelationshipValue(e.property);

    HouseOfQuality._calcFuncRequirementRelWeights();
};

HouseOfQuality._userReqRatingsValueChanged = function(e, uuid) {
    var rating = ((e.newValue === "-1") || (e.newValue === null)) ? "" : e.newValue;
    $("tr[data-uuid='" + uuid + "'] .hq_matrix_cell_rating[data-uuid_product='" + e.property + "']").text(rating);

    if (!e.isLocal) {
        // awareness highlight
        var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";
        $("tr[data-uuid='" + uuid + "'] .hq_matrix_cell_rating[data-uuid_product='" + e.property + "']").effect("highlight", {color: color}, 2000);
    }

    // update diagram
    HouseOfQuality.updateProductsDiagram();
};

/** LISTENER FuncRequirements **/

HouseOfQuality._funcReqValuesAdded = function(e) {
    var funcReqArray = HouseOfQuality._funcRequirements.asArray();
    for (var i = 0; i < funcReqArray.length; i++) {
        var funcReq = funcReqArray[i];
        // check if uuid exists in DOM
        if (!($("[data-uuid='" + funcReq.uuid + "']").exists())) {
            HouseOfQuality.setFunctionalRequirementColumn(funcReq);

            funcReq.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, HouseOfQuality._funcReqValueChanged);
            // add listener for funcReq relationships
            funcReq.dependancies.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (function(uuid) {
                return function(e) {
                    HouseOfQuality._funcReqDependanciesValueChanged(e, uuid);
                };
            })(funcReq.uuid));

            HouseOfQuality._calcFuncRequirementMaxRelationshipValue(funcReq.uuid);
        }
    }
    HouseOfQuality._calcFuncRequirementRelWeights();
};

HouseOfQuality._funcReqValuesRemoved = function(e) {
    jQuery.each(e.values, function(index, funcReq) {
        // awareness highlight
        var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";

        if (!e.isLocal) {
            $("td[data-uuid='" + funcReq.uuid + "']").effect('highlight', {color: color}, 2000, function() {
                $(this).fadeOut('fast', function() {
                    $(this).remove();
                });
            });
            $("td[data-uuid_funcreq='" + funcReq.uuid + "']").effect('highlight', {color: color}, 2000, function() {
                $(this).fadeOut('fast', function() {
                    $(this).remove();
                });
            });
            $("div[data-uuid_funcreq='" + funcReq.uuid + "']").parent().effect('highlight', {color: color}, 2000, function() {
                $(this).fadeOut('fast', function() {
                    $(this).remove();

                    // update column numbers
                    var row = 1;
                    $('.hq_matrix_cell_colnr').each(function(i, obj) {
                        obj.innerText = row++;
                    });
                });
            });
        } else {
            // delete without effect
            $("td[data-uuid='" + funcReq.uuid + "']").fadeOut('fast', function() {
                $(this).remove();
            });
            $("td[data-uuid_funcreq='" + funcReq.uuid + "']").fadeOut('fast', function() {
                $(this).remove();
            });
            $("div[data-uuid_funcreq='" + funcReq.uuid + "']").parent().fadeOut('fast', function() {
                $(this).remove();

                // update column numbers
                var row = 1;
                $('.hq_matrix_cell_colnr').each(function(i, obj) {
                    obj.innerText = row++;
                });
            });
        }
        // remove this funcReq from userReq.relationships
        // loop through user requirements
        var userReqArray = HouseOfQuality._userRequirements.asArray();
        for (var j = 0; j < userReqArray.length; j++) {
            var userReq = userReqArray[j];
            
            if (userReq.relationships.has(funcReq.uuid)) {
                userReq.relationships.delete(funcReq.uuid);
            }
        }
    });

    // adjust roof
    // calculate colspan of roof and adjust its width
    var totalFuncReq = HouseOfQuality._funcRequirements.length;
    $(".hq_roof").attr("colspan", totalFuncReq);
    $(".hq_roof").css("width", (totalFuncReq * 40) + "px");

    // draw roof
    HouseOfQuality.setCorrelationMatrix(totalFuncReq * 40, totalFuncReq);

    // adjust HoQ overall width
    $(".hq_house").css("width", HouseOfQuality.width() + "px");

    HouseOfQuality._addEditableListeners();
    
    // recalculate max relationship value
    var userReqArray = HouseOfQuality._userRequirements.asArray();
    for (var j = 0; j < userReqArray.length; j++) {
        var userReq = userReqArray[j];
        HouseOfQuality._calcUserRequirementMaxRelationshipValue(userReq.uuid);
    }
};

HouseOfQuality._funcReqValueChanged = function(e) {
    // awareness highlight
    var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";

    if (e.property === "name") {
        var name = e.newValue;
        if (name === "") {
            name = "Click to edit";
        }
        $(".hq_matrix_cell_funcreq div[data-uuid_funcreq='" + e.target.uuid + "']").text(name);
        if (!e.isLocal) {
            $(".hq_matrix_cell_funcreq div[data-uuid_funcreq='" + e.target.uuid + "']").parent().effect("highlight", {color: color}, 2000);
        }
    } else if (e.property === "improvementDirection") {
        var symbol = HouseOfQuality._getImprovementSymbol(e.newValue);
        $(".hq_matrix_cell_improvement[data-uuid_funcreq='" + e.target.uuid + "']").text(symbol);
        if (!e.isLocal) {
            $(".hq_matrix_cell_improvement[data-uuid_funcreq='" + e.target.uuid + "']").effect("highlight", {color: color}, 2000);
        }
    } else if (e.property === "target") {
        var target = e.newValue;
        if (target === "") {
            target = "none";
        }
        $(".hq_matrix_cell_target div[data-uuid_funcreq='" + e.target.uuid + "']").text(target);
        if (!e.isLocal) {
            $(".hq_matrix_cell_target div[data-uuid_funcreq='" + e.target.uuid + "']").parent().effect("highlight", {color: color}, 2000);
        }
    } else if (e.property === "difficulty") {
        var difficulty = ((e.newValue === "-1") || (e.newValue === null)) ? "" : e.newValue;
        $(".hq_matrix_cell_difficulty[data-uuid_funcreq='" + e.target.uuid + "']").text(difficulty);
        if (!e.isLocal) {
            $(".hq_matrix_cell_difficulty[data-uuid_funcreq='" + e.target.uuid + "']").effect("highlight", {color: color}, 2000);
        }
    }
};

HouseOfQuality._funcReqDependanciesValueChanged = function(e, uuid) {
    $("div[data-uuid-a='" + uuid + "'][data-uuid-b='" + e.property + "']").text(HouseOfQuality._getDependancySymbol(e.newValue));

    if (!e.isLocal) {
        // awareness highlight
        var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";
        $("div[data-uuid-a='" + uuid + "'][data-uuid-b='" + e.property + "']").effect("highlight", {color: color}, 2000);
    }
};

/** LISTENER Products **/

HouseOfQuality._productValuesAdded = function(e) {
    var productsArray = HouseOfQuality._products.asArray();
    for (var i = 0; i < productsArray.length; i++) {
        var product = productsArray[i];
        product.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, HouseOfQuality._productValueChanged);
        // check if uuid exists in DOM
        if (!($("[data-uuid='" + product.uuid + "']").exists())) {
            HouseOfQuality.setProductColumn(product);
        }
    }
};

HouseOfQuality._productValuesRemoved = function(e) {
    // obtain list of removed products. e.values does not work as intended as the products there are not initialized.
    var productHeaders = $(".hq_matrix_cell_product :first-child");
    var removedProducts = new Array();
    jQuery.each(productHeaders, function(index, productHeader) {
        var uuid = $(productHeader).data("uuid");
        if (undefined === HouseOfQuality.getProduct(uuid)) {
            removedProducts.push(uuid);
        }
    });
    
    jQuery.each(removedProducts, function(index, productUuid) {
        // awareness highlight
        var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId)) !== null) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";

        if (!e.isLocal) {
            $("div[data-uuid='" + productUuid + "']").parent().effect('highlight', {color: color}, 2000, function() {
                $(this).fadeOut('fast', function() {
                    $(this).remove();
                });
            });
            $("td[data-uuid_product='" + productUuid + "']").effect('highlight', {color: color}, 2000, function() {
                $(this).fadeOut('fast', function() {
                    $(this).remove();
                });
            });
        } else {
            // delete without effect
            $("div[data-uuid='" + productUuid + "']").parent().fadeOut('fast', function() {
                $(this).remove();
            });
            $("td[data-uuid_product='" + productUuid + "']").fadeOut('fast', function() {
                $(this).remove();
            });
        }
        
        // remove this product from userReq.relationships
        // loop through user requirements
        var userReqArray = HouseOfQuality._userRequirements.asArray();
        for (var j = 0; j < userReqArray.length; j++) {
            var userReq = userReqArray[j];
            
            if (userReq.ratings.has(productUuid)) {
                userReq.ratings.delete(productUuid);
            }
        }
    });
    
    // adjust HoQ overall width
    $(".hq_house").css("width", HouseOfQuality.width() + "px");

    // adjust colspan
    $(".hq_remainder_right").attr("colspan", HouseOfQuality._products.length + 6);

    // adjust CSS style attribute of first row for compatibility reasons...
    $(".hq_remainder_right:first").css("width", (HouseOfQuality._products.length * 30 + 180) + "px");

    // redraw diagram
    HouseOfQuality.updateProductsDiagram();
};

HouseOfQuality._productValueChanged = function(e) {
    if (e.property === "name") {
        var name = e.newValue;
        if (name === "") {
            name = "Click to edit";
        }
        $(".hq_matrix_cell_product div[data-uuid='" + e.target.uuid + "']").text(name);

        if (!e.isLocal) {
            // awareness highlight
            var color = (e.userId && (HouseOfQuality.getCollaboratorById(e.userId) !== null)) ? HouseOfQuality.getCollaboratorById(e.userId).color : "#ffff99";
            $(".hq_matrix_cell_product div[data-uuid='" + e.target.uuid + "']").parent().effect("highlight", {color: color}, 2000);
        }

        // update diagram
        HouseOfQuality.updateProductsDiagram();
    }
};


/** UTILS **/

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
}
;

/**
 * Creates a unique identifier based on some random parts.
 * 
 * @returns {String} a unique identifier.
 */
function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
}

function countProperties(obj) {
    var count = 0;
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
}

/**
 * Checks if a given element exists. Usage: $("#element").exists();
 * 
 * @returns {Boolean} true if the element exists, false otherwise.
 */
$.fn.exists = function() {
    return this.length !== 0;
};