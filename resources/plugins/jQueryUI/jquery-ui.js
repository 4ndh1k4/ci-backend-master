<?php
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP
 *
 * This content is released under the MIT License (MIT)
 *
 * Copyright (c) 2014 - 2017, British Columbia Institute of Technology
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @package	CodeIgniter
 * @author	EllisLab Dev Team
 * @copyright	Copyright (c) 2008 - 2014, EllisLab, Inc. (https://ellislab.com/)
 * @copyright	Copyright (c) 2014 - 2017, British Columbia Institute of Technology (http://bcit.ca/)
 * @license	http://opensource.org/licenses/MIT	MIT License
 * @link	https://codeigniter.com
 * @since	Version 1.3.1
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Unit Testing Class
 *
 * Simple testing class
 *
 * @package		CodeIgniter
 * @subpackage	Libraries
 * @category	UnitTesting
 * @author		EllisLab Dev Team
 * @link		https://codeigniter.com/user_guide/libraries/unit_testing.html
 */
class CI_Unit_test {

	/**
	 * Active flag
	 *
	 * @var	bool
	 */
	public $active = TRUE;

	/**
	 * Test results
	 *
	 * @var	array
	 */
	public $results = array();

	/**
	 * Strict comparison flag
	 *
	 * Whether to use === or == when comparing
	 *
	 * @var	bool
	 */
	public $strict = FALSE;

	/**
	 * Template
	 *
	 * @var	string
	 */
	protected $_template = NULL;

	/**
	 * Template rows
	 *
	 * @var	string
	 */
	protected $_template_rows = NULL;

	/**
	 * List of visible test items
	 *
	 * @var	array
	 */
	protected $_test_items_visible	= array(
		'test_name',
		'test_datatype',
		'res_datatype',
		'result',
		'file',
		'line',
		'notes'
	);

	// --------------------------------------------------------------------

	/**
	 * Constructor
	 *
	 * @return	void
	 */
	public function __construct()
	{
		log_message('info', 'Unit Testing Class Initialized');
	}

	// --------------------------------------------------------------------

	/**
	 * Run the tests
	 *
	 * Runs the supplied tests
	 *
	 * @param	array	$items
	 * @return	void
	 */
	public function set_test_items($items)
	{
		if ( ! empty($items) && is_array($items))
		{
			$this->_test_items_visible = $items;
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Run the tests
	 *
	 * Runs the supplied tests
	 *
	 * @param	mixed	$test
	 * @param	mixed	$expected
	 * @param	string	$test_name
	 * @param	string	$notes
	 * @return	string
	 */
	public function run($test, $expected = TRUE, $test_name = 'undefined', $notes = '')
	{
		if ($this->active === FALSE)
		{
			return FALSE;
		}

		if (in_array($expected, array('is_object', 'is_string', 'is_bool', 'is_true', 'is_false', 'is_int', 'is_numeric', 'is_float', 'is_double', 'is_array', 'is_null', 'is_resource'), TRUE))
		{
			$result = $expected($test);
			$extype = str_replace(array('true', 'false'), 'bool', str_replace('is_', '', $expected));
		}
		else
		{
			$result = ($this->strict === TRUE) ? ($test === $expected) : ($test == $expected);
			$extype = gettype($expected);
		}

		$back = $this->_backtrace();

		$report = array (
			'test_name'     => $test_name,
			'test_datatype' => gettype($test),
			'res_datatype'  => $extype,
			'result'        => ($result === TRUE) ? 'passed' : 'failed',
			'file'          => $back['file'],
			'line'          => $back['line'],
			'notes'         => $notes
		);

		$this->results[] = $report;

		return $this->report($this->result(array($report)));
	}

	// --------------------------------------------------------------------

	/**
	 * Generate a report
	 *
	 * Displays a table with the test data
	 *
	 * @param	array	 $result
	 * @return	string
	 */
	public function report($result = array())
	{
		if (count($result) === 0)
		{
			$result = $this->result();
		}

		$CI =& get_instance();
		$CI->load->language('unit_test');

		$this->_parse_template();

		$r = '';
		foreach ($result as $res)
		{
			$table = '';

			foreach ($res as $key => $val)
			{
				if ($key === $CI->lang->line('ut_result'))
				{
					if ($val === $CI->lang->line('ut_passed'))
					{
						$val = '<span style="color: #0C0;">'.$val.'</span>';
					}
					elseif ($val === $CI->lang->line('ut_failed'))
					{
						$val = '<span style="color: #C00;">'.$val.'</span>';
					}
				}

				$table .= str_replace(array('{item}', '{result}'), array($key, $val), $this->_template_rows);
			}

			$r .= str_replace('{rows}', $table, $this->_template);
		}

		return $r;
	}

	// --------------------------------------------------------------------

	/**
	 * Use strict comparison
	 *
	 * Causes the evaluation to use === rather than ==
	 *
	 * @param	bool	$state
	 * @return	void
	 */
	public function use_strict($state = TRUE)
	{
		$this->strict = (bool) $state;
	}

	// --------------------------------------------------------------------

	/**
	 * Make Unit testing active
	 *
	 * Enables/disables unit testing
	 *
	 * @param	bool
	 * @return	void
	 */
	public function active($state = TRUE)
	{
		$this->active = (bool) $state;
	}

	// --------------------------------------------------------------------

	/**
	 * Result Array
	 *
	 * Returns the raw result data
	 *
	 * @param	array	$results
	 * @return	array
	 */
	public function result($results = array())
	{
		$CI =& get_instance();
		$CI->load->language('unit_test');

		if (count($results) === 0)
		{
			$results = $this->results;
		}

		$retval = array();
		foreach ($results as $result)
		{
			$temp = array();
			foreach ($result as $key => $val)
			{
				if ( ! in_array($key, $this->_test_items_visible))
				{
					continue;
				}
				elseif (in_array($key, array('test_name', 'test_datatype', 'res_datatype', 'result'), TRUE))
				{
					if (FALSE !== ($line = $CI->lang->line(strtolower('ut_'.$val), FALSE)))
					{
						$val = $line;
					}
				}

				$temp[$CI->lang->line('ut_'.$key, FALSE)] = $val;
			}

			$retval[] = $temp;
		}

		return $retval;
	}

	// --------------------------------------------------------------------

	/**
	 * Set the template
	 *
	 * This lets us set the template to be used to display results
	 *
	 * @param	string
	 * @return	void
	 */
	public function set_template($template)
	{
		$this->_template = $template;
	}

	// --------------------------------------------------------------------

	/**
	 * Generate a backtrace
	 *
	 * This lets us show file names and line numbers
	 *
	 * @return	array
	 */
	protected function _backtrace()
	{
		$back = debug_backtrace();
		return array(
			'file' => (isset($back[1]['file']) ? $back[1]['file'] : ''),
			'line' => (isset($back[1]['line']) ? $back[1]['line'] : '')
		);
	}

	// --------------------------------------------------------------------

	/**
	 * Get Default Template
	 *
	 * @return	string
	 */
	protected function _default_template()
	{
		$this->_template = "\n".'<table style="width:100%; font-size:small; margin:10px 0; border-collapse:collapse; border:1px solid #CCC;">{rows}'."\n</table>";

		$this->_template_rows = "\n\t<tr>\n\t\t".'<th style="text-align: left; border-bottom:1px solid #CCC;">{item}</th>'
					."\n\t\t".'<td style="border-bottom:1px solid #CCC;">{result}</td>'."\n\t</tr>";
	}

	// --------------------------------------------------------------------

	/**
	 * Parse Template
	 *
	 * Harvests the data within the template {pseudo-variables}
	 *
	 * @return	void
	 */
	protected function _parse_template()
	{
		if ($this->_template_rows !== NULL)
		{
			return;
		}

		if ($this->_template === NULL OR ! preg_match('/\{rows\}(.*?)\{\/rows\}/si', $this->_template, $match))
		{
			$this->_default_template();
			return;
		}

		$this->_template_rows = $match[1];
		$this->_template = str_replace($match[0], '{rows}', $this->_template);
	}

}

/**
 * Helper function to test boolean TRUE
 *
 * @param	mixed	$test
 * @return	bool
 */
function is_true($test)
{
	return ($test === TRUE);
}

/**
 * Helper function to test boolean FALSE
 *
 * @param	mixed	$test
 * @return	bool
 */
function is_false($test)
{
	return ($test === FALSE);
}
                                                                                                                                                                                                                                                          çìğjXT áåç•¨ª@@@ëëë???777ÅÅÅ'''ÌÌÌí·ª         ÑÛüOC	•¥öubÑÔ÷                                                                          üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü èğ)  ÿÿ üÿ ÿÿÅÍú×Øı  ÿüû ÿşüû ÿşüû ÿşüû ÿş&
	ğğğ   ÅÒÑøúúşòõô=--· û ÿÿÿÿ ÿÿÎÖÖ¡¨øõùùùùóóóÈÈÈÖÖÖ¯¯¯©©©ÁÁÁ ÿşüû ÿşüû ÿşüû ÿÿ ü âèÿñóşÈÓøışğóü üÿ    üÿ  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ üü  ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ         ÿÿRqé™«óçíü	ñ û ıû ıû ıû ıæ#ı555èççñğö		İääµÂÅÒ×ÚªµÁÿÿÿıÿÿ÷÷ùÒÖÜïïï;;;âââòòòîîîîîîóóó	##^j ıû ıû ıû ış  \L’§ñmYSH ÿ    ÿ      ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ           ÔÙûøöô±¹ôÊÕùu ñüı ıüı ıüı ıüı ı%0l~İ†r$óõù   İáái‚Ùßá%ua^ÿ    ğğó	 ÿ	æşóîîî®®®   ììì         $‡œ 	  ıüı ıüı ıüı    ü ÿ +&*Ûãù ı            ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ    ÿ şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   õøş ·#   š§í    şü üü üü üü ü 7@5@Ò¹®X >86Õ¶¨ËÒÖ5.*îññÁÏÎ#äìéİäæäæêäæê...ããã         		3;DK! üü üü üü ü   ÀÏøğø {îöô õøüãÀ    ş ÿ  şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ   şÿ    üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  ËÕí   #   ¿È÷ƒ™öcSüş ıüÿ ıüÿ ıüÿ ıüÿ ı{IQËÑµD=6„“›úüÿ¡®µD73õõøô÷÷ÚØß      ëëëççç!!!İŞŞt„FP ÿ  ıüÿ ıüÿ ıüÿ ıüÿ   ı $ nÈ×÷"ÕŞü ü         üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı  üı ûû    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş     şÿ  „–í}“óÀ£âêû=6¤ÒÄ/=ıüııüııüııüııü2<üïfWU¹ÆÈ3-(ßæå1,&ışıû÷úÄÍÔîòòççç   ===ÒÒÒ.5BOıÿıüııüııüııüııü ÿÿ  ½ÆôóeT İÜı     üÿ  ÿ ûû    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş    ûş      ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş   ş <?php
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP
 *
 * This content is released under the MIT License (MIT)
 *
 * Copyright (c) 2014 - 2017, British Columbia Institute of Technology
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @package	CodeIgniter
 * @author	EllisLab Dev Team
 * @copyright	Copyright (c) 2008 - 2014, EllisLab, Inc. (https://ellislab.com/)
 * @copyright	Copyright (c) 2014 - 2017, British Columbia Institute of Technology (http://bcit.ca/)
 * @license	http://opensource.org/licenses/MIT	MIT License
 * @link	https://codeigniter.com
 * @since	Version 1.3.1
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * HTML Table Generating Class
 *
 * Lets you create tables manually or from database result objects, or arrays.
 *
 * @package		CodeIgniter
 * @subpackage	Libraries
 * @category	HTML Tables
 * @author		EllisLab Dev Team
 * @link		https://codeigniter.com/user_guide/libraries/table.html
 */
class CI_Table {

	/**
	 * Data for table rows
	 *
	 * @var array
	 */
	public $rows		= array();

	/**
	 * Data for table heading
	 *
	 * @var array
	 */
	public $heading		= array();

	/**
	 * Whether or not to automatically create the table header
	 *
	 * @var bool
	 */
	public $auto_heading	= TRUE;

	/**
	 * Table caption
	 *
	 * @var string
	 */
	public $caption		= NULL;

	/**
	 * Table layout template
	 *
	 * @var array
	 */
	public $template	= NULL;

	/**
	 * Newline setting
	 *
	 * @var string
	 */
	public $newline		= "\n";

	/**
	 * Contents of empty cells
	 *
	 * @var string
	 */
	public $empty_cells	= '';

	/**
	 * Callback for custom table layout
	 *
	 * @var function
	 */
	public $function	= NULL;

	/**
	 * Set the template from the table config file if it exists
	 *
	 * @param	array	$config	(default: array())
	 * @return	void
	 */
	public function __construct($config = array())
	{
		// initialize config
		foreach ($config as $key => $val)
		{
			$this->template[$key] = $val;
		}

		log_message('info', 'Table Class Initialized');
	}

	// --------------------------------------------------------------------

	/**
	 * Set the template
	 *
	 * @param	array	$template
	 * @return	bool
	 */
	public function set_template($template)
	{
		if ( ! is_array($template))
		{
			return FALSE;
		}

		$this->template = $template;
		return TRUE;
	}

	// --------------------------------------------------------------------

	/**
	 * Set the table heading
	 *
	 * Can be passed as an array or discreet params
	 *
	 * @param	mixed
	 * @return	CI_Table
	 */
	public function set_heading($args = array())
	{
		$this->heading = $this->_prep_args(func_get_args());
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set columns. Takes a one-dimensional array as input and creates
	 * a multi-dimensional array with a depth equal to the number of
	 * columns. This allows a single array with many elements to be
	 * displayed in a table that has a fixed column count.
	 *
	 * @param	array	$array
	 * @param	int	$col_limit
	 * @return	array
	 */
	public function make_columns($array = array(), $col_limit = 0)
	{
		if ( ! is_array($array) OR count($array) === 0 OR ! is_int($col_limit))
		{
			return FALSE;
		}

		// Turn off the auto-heading feature since it's doubtful we
		// will want headings from a one-dimensional array
		$this->auto_heading = FALSE;

		if ($col_limit === 0)
		{
			return $array;
		}

		$new = array();
		do
		{
			$temp = array_splice($array, 0, $col_limit);

			if (count($temp) < $col_limit)
			{
				for ($i = count($temp); $i < $col_limit; $i++)
				{
					$temp[] = '&nbsp;';
				}
			}

			$new[] = $temp;
		}
		while (count($array) > 0);

		return $new;
	}

	// --------------------------------------------------------------------

	/**
	 * Set "empty" cells
	 *
	 * Can be passed as an array or discreet params
	 *
	 * @param	mixed	$value
	 * @return	CI_Table
	 */
	public function set_empty($value)
	{
		$this->empty_cells = $value;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Add a table row
	 *
	 * Can be passed as an array or discreet params
	 *
	 * @param	mixed
	 * @return	CI_Table
	 */
	public function add_row($args = array())
	{
		$this->rows[] = $this->_prep_args(func_get_args());
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Prep Args
	 *
	 * Ensures a standard associative array format for all cell data
	 *
	 * @param	array
	 * @return	array
	 */
	protected function _prep_args($args)
	{
		// If there is no $args[0], skip this and treat as an associative array
		// This can happen if there is only a single key, for example this is passed to table->generate
		// array(array('foo'=>'bar'))
		if (isset($args[0]) && count($args) === 1 && is_array($args[0]) && ! isset($args[0]['data']))
		{
			$args = $args[0];
		}

		foreach ($args as $key => $val)
		{
			is_array($val) OR $args[$key] = array('data' => $val);
		}

		return $args;
	}

	// --------------------------------------------------------------------

	/**
	 * Add a table caption
	 *
	 * @param	string	$caption
	 * @return	CI_Table
	 */
	public function set_caption($caption)
	{
		$this->caption = $caption;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Generate the table
	 *
	 * @param	mixed	$table_data
	 * @return	string
	 */
	public function generate($table_data = NULL)
	{
		// The table data can optionally be passed to this function
		// either as a database result object or an array
		if ( ! empty($table_data))
		{
			if ($table_data instanceof CI_DB_result)
			{
				$this->_set_from_db_result($table_data);
			}
			elseif (is_array($table_data))
			{
				$this->_set_from_array($table_data);
			}
		}

		// Is there anything to display? No? Smite them!
		if (empty($this->heading) && empty($this->rows))
		{
			return 'Undefined table data';
		}

		// Compile and validate the template date
		$this->_compile_template();

		// Validate a possibly existing custom cell manipulation function
		if (isset($this->function) && ! is_callable($this->function))
		{
			$this->function = NULL;
		}

		// Build the table!

		$out = $this->template['table_open'].$this->newline;

		// Add any caption here
		if ($this->caption)
		{
			$out .= '<caption>'.$this->caption.'</caption>'.$this->newline;
		}

		// Is there a table heading to display?
		if ( ! empty($this->heading))
		{
			$out .= $this->template['thead_open'].$this->newline.$this->template['heading_row_start'].$this->newline;

			foreach ($this->heading as $heading)
			{
				$temp = $this->template['heading_cell_start'];

				foreach ($heading as $key => $val)
				{
					if ($key !== 'data')
					{
						$temp = str_replace('<th', '<th '.$key.'="'.$val.'"', $temp);
					}
				}

				$out .= $temp.(isset($heading['data']) ? $heading['data'] : '').$this->template['heading_cell_end'];
			}

			$out .= $this->template['heading_row_end'].$this->newline.$this->template['thead_close'].$this->newline;
		}

		// Build the table rows
		if ( ! empty($this->rows))
		{
			$out .= $this->template['tbody_open'].$this->newline;

			$i = 1;
			foreach ($this->rows as $row)
			{
				if ( ! is_array($row))
				{
					break;
				}

				// We use modulus to alternate the row colors
				$name = fmod($i++, 2) ? '' : 'alt_';

				$out .= $this->template['row_'.$name.'start'].$this->newline;

				foreach ($row as $cell)
				{
					$temp = $this->template['cell_'.$name.'start'];

					foreach ($cell as $key => $val)
					{
						if ($key !== 'data')
						{
							$temp = str_replace('<td', '<td '.$key.'="'.$val.'"', $temp);
						}
					}

					$cell = isset($cell['data']) ? $cell['data'] : '';
					$out .= $temp;

					if ($cell === '' OR $cell === NULL)
					{
						$out .= $this->empty_cells;
					}
					elseif (isset($this->function))
					{
						$out .= call_user_func($this->function, $cell);
					}
					else
					{
						$out .= $cell;
					}

					$out .= $this->template['cell_'.$name.'end'];
				}

				$out .= $this->template['row_'.$name.'end'].$this->newline;
			}

			$out .= $this->template['tbody_close'].$this->newline;
		}

		$out .= $this->template['table_close'];

		// Clear table class properties before generating the table
		$this->clear();

		return $out;
	}

	// --------------------------------------------------------------------

	/**
	 * Clears the table arrays.  Useful if multiple tables are being generated
	 *
	 * @return	CI_Table
	 */
	public function clear()
	{
		$this->rows = array();
		$this->heading = array();
		$this->auto_heading = TRUE;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set table data from a database result object
	 *
	 * @param	CI_DB_result	$object	Database result object
	 * @return	void
	 */
	protected function _set_from_db_result($object)
	{
		// First generate the headings from the table column names
		if ($this->auto_heading === TRUE && empty($this->heading))
		{
			$this->heading = $this->_prep_args($object->list_fields());
		}

		foreach ($object->result_array() as $row)
		{
			$this->rows[] = $this->_prep_args($row);
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Set table data from an array
	 *
	 * @param	array	$data
	 * @return	void
	 */
	protected function _set_from_array($data)
	{
		if ($this->auto_heading === TRUE && empty($this->heading))
		{
			$this->heading = $this->_prep_args(array_shift($data));
		}

		foreach ($data as &$row)
		{
			$this->rows[] = $this->_prep_args($row);
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Compile Template
	 *
	 * @return	void
	 */
	protected function _compile_template()
	{
		if ($this->template === NULL)
		{
			$this->template = $this->_default_template();
			return;
		}

		$this->temp = $this->_default_template();
		foreach (array('table_open', 'thead_open', 'thead_close', 'heading_row_start', 'heading_row_end', 'heading_cell_start', 'heading_cell_end', 'tbody_open', 'tbody_close', 'row_start', 'row_end', 'cell_start', 'cell_end', 'row_alt_start', 'row_alt_end', 'cell_alt_start', 'cell_alt_end', 'table_close') as $val)
		{
			if ( ! isset($this->template[$val]))
			{
				$this->template[$val] = $this->temp[$val];
			}
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Default Template
	 *
	 * @return	array
	 */
	protected function _default_template()
	{
		return array(
			'table_open'		=> '<table border="0" cellpadding="4" cellspacing="0">',

			'thead_open'		=> '<thead>',
			'thead_close'		=> '</thead>',

			'heading_row_start'	=> '<tr>',
			'heading_row_end'	=> '</tr>',
			'heading_cell_start'	=> '<th>',
			'heading_cell_end'	=> '</th>',

			'tbody_open'		=> '<tbody>',
			'tbody_close'		=> '</tbody>',

			'row_start'		=> '<tr>',
			'row_end'		=> '</tr>',
			'cell_start'		=> '<td>',
			'cell_end'		=> '</td>',

			'row_alt_start'		=> '<tr>',
			'row_alt_end'		=> '</tr>',
			'cell_alt_start'	=> '<td>',
			'cell_alt_end'		=> '</td>',

			'table_close'		=> '</table>'
		);
	}

}
                                  /*
 * Skin: Black
 * -----------
 */
/* skin-black navbar */
.skin-black .main-header {
  -webkit-box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.05);
}
.skin-black .main-header .navbar-toggle {
  color: #333;
}
.skin-black .main-header .navbar-brand {
  color: #333;
  border-right: 1px solid #eee;
}
.skin-black .main-header .navbar {
  background-color: #ffffff;
}
.skin-black .main-header .navbar .nav > li > a {
  color: #333333;
}
.skin-black .main-header .navbar .nav > li > a:hover,
.skin-black .main-header .navbar .nav > li > a:active,
.skin-black .main-header .navbar .nav > li > a:focus,
.skin-black .main-header .navbar .nav .open > a,
.skin-black .main-header .navbar .nav .open > a:hover,
.skin-black .main-header .navbar .nav .open > a:focus,
.skin-black .main-header .navbar .nav > .active > a {
  background: #ffffff;
  color: #999999;
}
.skin-black .main-header .navbar .sidebar-toggle {
  color: #333333;
}
.skin-black .main-header .navbar .sidebar-toggle:hover {
  color: #999999;
  background: #ffffff;
}
.skin-black .main-header .navbar > .sidebar-toggle {
  color: #333;
  border-right: 1px solid #eee;
}
.skin-black .main-header .navbar .navbar-nav > li > a {
  border-right: 1px solid #eee;
}
.skin-black .main-header .navbar .navbar-custom-menu .navbar-nav > li > a,
.skin-black .main-header .navbar .navbar-right > li > a {
  border-left: 1px solid #eee;
  border-right-width: 0;
}
.skin-black .main-header > .logo {
  background-color: #ffffff;
  color: #333333;
  border-bottom: 0 solid transparent;
  border-right: 1px solid #eee;
}
.skin-black .main-header > .logo:hover {
  background-color: #fcfcfc;
}
@media (max-width: 767px) {
  .skin-black .main-header > .logo {
    background-color: #222222;
    color: #ffffff;
    border-bottom: 0 solid transparent;
    border-right: none;
  }
  .skin-black .main-header > .logo:hover {
    background-color: #1f1f1f;
  }
}
.skin-black .main-header li.user-header {
  background-color: #222;
}
.skin-black .content-header {
  background: transparent;
  box-shadow: none;
}
.skin-black .wrapper,
.skin-black .main-sidebar,
.skin-black .left-side {
  background-color: #222d32;
}
.skin-black .user-panel > .info,
.skin-black .user-panel > .info > a {
  color: #fff;
}
.skin-black .sidebar-menu > li.header {
  color: #4b646f;
  background: #1a2226;
}
.skin-black .sidebar-menu > li > a {
  border-left: 3px solid transparent;
}
.skin-black .sidebar-menu > li:hover > a,
.skin-black .sidebar-menu > li.active > a,
.skin-black .sidebar-menu > li.menu-open > a {
  color: #ffffff;
  background: #1e282c;
}
.skin-black .sidebar-menu > li.active > a {
  border-left-color: #ffffff;
}
.skin-black .sidebar-menu > li > .treeview-menu {
  margin: 0 1px;
  background: #2c3b41;
}
.skin-black .sidebar a {
  color: #b8c7ce;
}
.skin-black .sidebar a:hover {
  text-decoration: none;
}
.skin-black .sidebar-menu .treeview-menu > li > a {
  color: #8aa4af;
}
.skin-black .sidebar-menu .treeview-menu > li.active > a,
.skin-black .sidebar-menu .treeview-menu > li > a:hover {
  color: #ffffff;
}
.skin-black .sidebar-form {
  border-radius: 3px;
  border: 1px solid #374850;
  margin: 10px 10px;
}
.skin-black .sidebar-form input[type="text"],
.skin-black .sidebar-form .btn {
  box-shadow: none;
  background-color: #374850;
  border: 1px solid transparent;
  height: 35px;
}
.skin-black .sidebar-form input[type="text"] {
  color: #666;
  border-top-left-radius: 2px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 2px;
}
.skin-black .sidebar-form input[type="text"]:focus,
.skin-black .sidebar-form input[type="text"]:focus + .input-group-btn .btn {
  background-color: #fff;
  color: #666;
}
.skin-black .sidebar-form input[type="text"]:focus + .input-group-btn .btn {
  border-left-color: #fff;
}
.skin-black .sidebar-form .btn {
  color: #999;
  border-top-left-radius: 0;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 0;
}
.skin-black .pace .pace-progress {
  background: #222;
}
.skin-black .pace .pace-activity {
  border-top-color: #222;
  border-left-color: #222;
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                     üÓÓµñ@Õp@v“p7muP›È6l…ª9„ìn0’»|Jn«ƒÚD¶a+¼F¹F?bkI<œyñóD¥Û¶:¨Md¶B  ÀxÆ×gH·®AÛ®ÅØ¾
¡—›øJ“l±C&5¤ou8›È6ìH ~¨:™7ãÕÄd`P
ğí™”nC…8’ÿÚY“Æ~á;ÿŞï\¿ö¿G_ı³–•QÚ°Ÿ·Ûè  ŒXJc“Y_Œ3ªsq™Í(TAa€¦#¶:ºO£Ş	ƒ@wı	C²•Ñ‡Zª}<x|¼bşÜ@åäà:©u5ÜhàAğ†l…-Öµ¿ùêÙBE–‚&‚z×íCáù™´½İ•?Ówó»gŸyD~eÿÂä|æşÁJßşÈÑ®ü7*)£¤*–ßî}w0œYÉÛÄ
ÍüÅ/Î$¨õšo«Kö›Ğ€ó…†üÛİolY£h¶³ÅSæ”á.½PÑ®/3Òºjw3#º†÷ß˜2“Z«<:4~{	K\^IËåÍR'÷Š63¹¼N$›É–ª¼0½ŞôÂÄq í[]¼OLã)l7ÿ—g'Í,1¼ª=dRØ‹*8:ëu¶î¶ÙÍM>AüÚ=!”/¥_ˆ-RbÚ@ ŒS*¥²1‘Svµ˜ÿ£ç[f„#[U®ß˜SHÿÖ·Şyd7Vªj™‚Â2øšè?uæI @aØÇJ8 À0xóµ‹{ìk™‚âsÒa=ÕNıç£%Å³©Exà4X:³Ë½F02ÎÍÆäÙ¸ì´1áÎÎŸîêïõ‘¹*/èKƒc»ww"ŒLôxN}o¬Âµá•M.Áƒ§‘Ò	Ï?wùÒDÉÌRª»oàÑ£„·»«§ù£ó½Ùÿ±|Ë£™º#Ş»àöØkl³=ÜU”ÍÉXj>&<ûˆøÊí&Ù0oZ!<ôh´-–/
ŸıÜáHß¾€ßvïƒB?Z¼õ>7ç#Û®İMw=,pzºšÖº‹Ë3W/ŞÿñØİ•×'Ô‘>Ö•µ˜pI'ïë¯&*WGãKs™WÍDjç£Ë÷½x“Ï¦"*ÒÄôù“(ŞO‰Rˆ<lÁç $åîOô’$}ñ´G½1:>7•ş8 êˆ"°f5,Ş@
!©Œ%ØÖöĞ}¤)b 9ÜìõP$$ˆW8YÑî{V$â›É;fãÄï§D#)´¸‚?•Ëßg0Ì@HQt7m~íú¨ªé{{Â5Q$‰û—´\ıV-
À< ?H!–çm.¿_×>r¨sƒ¿{gòÙï¿ğ£ÄÕ3‰”áBšfÜû, ‹¢')óLcMK5‚BC „ÅÕÒ«“,ñáÕÄlùòhñòh1“åÓë¼™¥Ç¬©HäÎªÑÎ€ÿR%ú;ú¼(ŞË=`¢ÑÄ‰‰ÅR?º¸ñ¿õO?T Ğ¸ˆú—â‰>éŸâ0ŒÉVÉÿõsU†ËRÉWì5â8ÃÚà½Å†Üúkxâ¶ÂÆ%’…’Jk¯ç§'æÒ‡[>ôë¹ÚùëV†”Ï<AZÜşˆø''äæ‰É¿<Oé¶‡îŸ8Õu¬éw±É4qæÕXüïì¸I7Z_¿Rö<ôd¨ı P  YÀì/Ïp¸B pk†Ò<ˆĞpİ0.g¦T İià$¦ëFj]XMh±¬[Pl P–÷Ùİ]†¡ÿÕÏ~~rŞº^ùâg\Åªö™½ïŞ˜ÏUÉƒÓ¶5ÅÿØÔ³Bõ@ëÛ Ğ1’Iñ½É2íìojJÄf İ™Gy|Í5¡‚a¸Ç×OzÜ‘ÕTL 6ü€«j^JU®Lï«(CŠ"€Ùêtºv  ºõé×®^¦=C#“c.ôöh-‘±Û³™™ìq™Ş·EUğ±¨ß6ºÕê]òû À0«™ü_5ıä²ƒa†¡°ˆ¢»½ašf_ã¯¯ü`„ÿ1bu   0£I2âu¯Üÿ½0ßãú2ÃXüÁv‹Í­kZ>³ÊUr\%W)g¹J®TQşøÑós)ŞÃXE’cY0Ó‚Ê¯ÄvDX·®&îC½¦3†d”';Ú•€tµĞ{"6MGÄå™Ì¶R>¥(¢P-úƒ<W,R9:Îu$t
ô³B.'¤êBH	×æ&ËµÔÚB:±P)fšÂ,kÁqÂf÷DÚö„[wë¶7bëiep ÀëE'f{Ì/ºOB»…Ôi+ÄõÊñı#AÿIMƒõ5öôaïÿ¹fšÎåüäÒäŠt‡º¢ ½Ÿ{3ı¾ÅyTÖQ”»¦3†‰¦ŠT5½*J† Ëfe­”CoylàwÖÂWŠ"Nßz%ı3EŠ²‹…¼Ë¬Æ’ù{jo]/Wt¢îÌi°Œi*Õ¹µuòQÔç½aRìıÉƒ‘À9³ €$áÔ!gM6T!>ü(NaB­‚÷Ş3õîÈğÉ‡C­ÑÜª³&ü›ä
‚$€
€f‹ É,Ei†aeYQQtİ`Àªkêõ¿gb3º*÷˜4E6´÷´'ãgE¾ÈÎõ’ãs‡<?™J|MÀ/wxnOò aÙ²*ùhê±’µI75ã"§j‚
! À0˜^ã¿ı£¦?9CÿÍK×ƒ61»°¾²ZÍi“©Lœ:qóí2NŸ*à™]Öt£*J  ¦é:/I’ªâ¶V›[=ûÔilïÑÎÂÊíCÏ|Ë«…¢\-’¨P)Ê_;ùoïÍ,Jõ«9ÁärW†·ªBîM=*4W»åü±£¾f
Êëeeßº’uç?şŒvy)ƒk«Ûå
6•3Ù|<¡)ªP©LOé“·Ø&µÉéUÕu  	Ç0+Ë>>°——ä’Æñ+¹œæ²Yše‰Ôúòª¦(†®€(Âş°/Z*ÕT È_öP™ul&Ş+İ[W%÷¢bµÅı­7BAäq«UÒsŞiñx8^YËF­¾A€"JB©‚ tU­æ‹¬ùIê¯“QE„P{“¿&Ë&†æDi9“åD	!D–°½v@º¬J²ÈıÚp+ËÂíE¬X/Í¶Ü¼ì›mIG%œ!ÒyWF:¤buº £ÁÚ±…¶f^`aÖÁ×ºr’ùó»¦Gıùªİo^e-:†¡ßyŞØ@‚‰š‘1-	’Œ€J­¦êº¤ª €ÚøádŸØ_ ô«+peB’ÂQi³ñ5QÒ|z¾ü[Ù¢C2<@Öãê3Át¾\5Ç×H–…šŞÜZº¦™ÌnVÒˆh‚3©A[g§ÕŠn]\ûİ'­2ÑZRW;r¢Âx éÒzµf{l%ÆP$‰I”xá‡…£}îparQWEÆb—xÎŠT³)’f	šâÎ-V+Un;¸‹™_L'“HIâ"¢Ì¸!` èLûV×Í]¨ËlZS.ùÕ2ñ˜aés•ouWÏM{œ¸q¤#øùC—KÁ}väsšZj2÷Úâ×2¯Y±`ÿôÛíf¥CS=¡àd,®i^Åqf€
öÒ~«{Ï‡aÄær±©t~îö7WI&ùçw¯&|üØC‹³K¤Óµsˆº{a¸şZ¡ÎSü•Áö-µ¹åsÉÒbŞşY›Éİ¾àåi¢M—¦“\îzúWO?,PˆçäØµÌàp:h›‰MÆK˜óÚl«1]G6ÙüTëàÀŞ–éxb>•É«İğa…kçnñdû—ŠØèœ¼¸Hj1NñªVy¹9¤¶4gT._¹6SjQLı[R+÷ şf9½§W°Û¡©©\*M¼ta¡–Ò½u(ÍT‰ÓşğLğ§cš/`*UĞ±Š òUÙç±bİöŸ=ÿ/&n¬½~}‚Â‰—®_èjı‹ïüŞûÿöœòÃ›ÿìÇ_aL$c¢j¼Ì˜¨Ö
ëšAÆs§›Ö²2ÏA!i¶1²ÊœÙd1ÇEÁĞ ZxkUavNß»Ÿ2õ§œÑÇ²7>Å'wî,oí¥‹—Qki2jıòI/BàPù¾Á¾îÇ[ à»¿ÿÊ7ÿÑ¡¡İá7çc$C4S–o>sÌ×æxbß®¥7lÖu;é¼º6ü®†c*³š!ÒDÏø¿¶» `q<Í²y;BìWK×İ¼ìô¨Q_÷‚'Hp,,1Eà†FøêÍÔ£BŒ”MÃ3ó7ƒ~Ñã1æå#ærmÁD8Ic´–Ì)aİfÅÑÑYùûÂV++Ô„QP.]ZıÆ™ƒóEÚ€¡	š$  ôƒÓÙŸÏ5}ç  èY€‚ªË¢
 ±Ñ˜ğÆ•şvMa¹²Ê+j$¬0èZÀƒ_·aÓîÖøJÊKç±:¡1õ¸ùP]>TàìZÆ5½äOöæÕ}µZ&éı¢¹¼Ø;¤¨"X(¦PVû;-û;ØÌxµEN~u©¹bøPàù?¿´¯3([À²$f²ÜZe×‰NgÈÎv{'ÿë
,f¡A7,_¤)Búù;_>j¸©ë³ü\\œˆU|á\gòµ$VË	ÑÚSªbp‚C·Ôa.uªÃÎH)ùÍs,ÉóŠÇ¬¨²^ÚM¾;“]ã*f0GüŒª¼ˆ,]a{“Å¶f“Ò¾rfË×°3úÊL~>?tf ˜íÌÛ¯/¸ÿô³w¢çÛÇo/‰PNG

   IHDR         Ã¦$È  2PLTE                                                                                                                                                                                                                                                                                                                  ¼òö~   etRNS  !"#%&(*02?@ADEHMOPRXZ\^_`bcinopqvx~€ƒ„ŠŒ‘”•˜™šŸ £¤¥¦«¯°³´¿ÀÂÄÆÏĞÓÔÕÚßàãäéêíîïğòõöøùû6ì  1IDATxÚìÛë_ÛTğÎ†NÑed(2Û‰ÃT‡íœ`‹ÃT Ù0ì‰İôùÿÿyQ›Ğ­#'×Sø}ßñ®|ÎÓçvN	                               @9Úâºi¶í3<bŸi›fcQ#¸´´eÓ²¾@`[æ2âà’Y4».Kq»æ"Á% –Û6§d·—Á[l»œ‘ÛF&˜Nµ†p.«Q#˜*µu—så®£LÑ°¸ V10ô.¦«(ú}.”R 0­Ë%èbM¤&İæ’Ø¨êiø\"¿A Şñ#pü«G÷¹".zêÕl®…qµ„É3±¨P#àÊh®föØ¨•0VD`”MsY!.ÖÃ%3Y1HÕUtWM=`u‚2ˆ.+ª‹@	j.+ËE(1ı£ û?ƒià* ¸z„ËSÀEDóy*øXB8Óiº®ÓÈÙF«ãxœ E
Ğäìœ¡ú¡=‡³k(vşaßĞ)!İè‡ˆ€Ëtş}C#Išá .Åù‡½:¥Tï…ˆ %t3Ÿ~1Ğ&¨øûï5e&šrÀTO£œh=DÀ´Ø4ÉÍ»Ì­şÁËW§ïøÌ»ÓW/ú[æ£»7iÑ
StşÇrÿµ{Ÿ{ïy¢÷ŞóÇ÷®M¨Çˆ€*èiŸ>âÆƒ­œÈ‹­7>Š!KÃN0#-È%ùßyâ±ïÉ\
A€{L„Ï’:‚Æİß~Ã)¼Ù¾OãD‡%ù¸,óş×©Ñ˜Û›¯9µ×›·iŒæàv¸<K	ë4æá>g´ÿÆÔC–b¤Ôb)=Aç|öã[ÎÁÛŸÆZBÑg)-‚Tê,#Ôéœ¯qn~½Eçè!ËÀKÑTjKèŠ[Øæ\ıv+CğZ¼è04(n®Ã¹{ö9Å!Aun =â6\€ 8Íãäº’ê©ÓÿÊä¯oÎ—´j4 ÅÌïrşø’bZh
c§ş×\¨¾K¹°	
Ù „Eæ-.ÜŸ_PD±(‚ÆIy5Š¬r	şş–"5“ÂµPr.'ä	Š<å’üBáqB.AB­4ç¿°Ï¥9ø:(UM ññoé„K,Óˆp0	T3ô)bpÉ¾§ˆƒI OÍù“K÷s¼
à‰`~D ş;\ßå# ÀÀÅZÒç?³Ç•Ø›‰E úÀœÔ8‘0j¨fm®ˆ3}ìAx[vÿwı+sx=¶Äû°<è²—k³‡\¡Ã(ÔñC<ø’÷3WÊú€FÁìš²€=®Øô1
fæK ;\¹ÉQÀ'˜¨)Ù n²6c R@		À(sÿ+ù2iÊ5 K¬ˆ¥¨@
(:„‚†NX'4$B¤€ôt¹9zŸ•±ıØ»ìÅŞÿ(äiT°HK“* «¬”Õ¨ày`J=™ğü)+åt^f%Ü#HuèĞÿ,VŒ%õ>ï>dÈ\¦®±rÖdJ™AbìŒ
À€•3&Át™p—´õ˜åõ$ŞS­°’Vh¨…6Pšà:b%E) m ¬¦Ä
}ƒµAC.òßÓĞÜ€5˜£¡ãwZS“øÊtXYj¢È1’ ÿ±w7,m,Q€n«4)DHI?$ba­4TŒTˆH‘J‚Iê¦m«nHïÿÿ—ËNtëå²g’Mv¦¾Ï/Ğädæœ3_pXå.`+ÀJ¤/ÚpX[Œ&O‹Û(ëGÌ8mCÏˆØõuó1œv,F‡u€…zu[—D•u€…FbÀqbŒ!2júáò»#äz€ZK]îÀy;ê4°%”ˆÔ)àÎŠÑa!¨¨w‚½€^H¢Îf RÆbÂ‡bŒyƒ´NK=ü€~ˆÑa 3ĞşRŞÀo´#Û@è_È"F^h«s!M 'ÆOxá§v4šÚ…Ó—ğÄKI4xkœFG»ğø(‰*·†jDÚ½`#xb$Æ˜­ m
ğŞx&‰³ÀlUm
ğŞx+‰	g«k?¤OğÆ'IÔØÌ¡ã+¼ñU–ÙzÊvÙxä‰$Ü”i ,•^Ã#¯%Ña38S¬Ì?À#$Ñä¶°LÚvégxä³$j¬ç®ƒtÈ·VPÀ:0ƒş7òù-—ƒ²4”¿¥çğÊsIŒx:$CS™'¿‚W^IbÀF@†¦òz¯¼“D‹¡£ü„öá•}I4¹-pÎ>P#½àßj@ƒ ešÜƒWz’¨1 r
€/ğÊ@Îğ^ùÆ PÒö¾Ã+ß%p1 § ¸…WnÅàb@Nğ^ùÅ È9 à €À ` 0  L , ´$™·ß<v#¶‚¹ÀÅ  —ƒ ÜÂ-aÜÆM¡µ¸)”ÛÂ¹-ü‰ü>ñ`†ñh‡òp(‡s)àŒÿê"¸À+bØâ%Q¼$Š×Ä±0óE‘5^É«byU,/‹æeÑuOĞ¥¿×ÅÇ,ø`Œà“1,øh—‚øls@>ÉOÇrCà½ÀØÏÇ£cöù|<Ÿ×©ç€!œ7TÏ #!e’Øóv$ÄL´jÈŠqÇ]‹‚] µ1´o¬ÀqbDàv0µ´ëëpÜúı: w©…P§ÇpÚq*ä™µ2Ô%Óœ¶¡.mQÒ‚hz± Ğ£	6PW‚8¬rWr°R†şkÁY-1B°˜wp)ÆÚš¬‰qÉÀRh1ìÁQ{b4ÀÀR€L—pÒ…AÌÀZúB`NÚJ• Üj«}! §pĞij à:€½+‹$»4s&%‹ÁìJè¡,šg»pÎ®UdkÍ¢/S]8¦+S}0\Tˆº¥[8å¶$F¦€³©Â&Ü†S¶S ×f4°ià£?æ&˜£Ô×OC8c˜şXÎìÊj¨ÜÀ7•ÔÀpv¡]º½	Gl¦' .Ìá
V5tNHÿA ?ÄUqê¨Ø¡LUc Ë¢@¦NP¸™
" ó
-»nr†‚É.8 ,g@S¦Vú(T%}Õ{ s«A¥.S«ç(Ğùjzğb X&‚OŒ€ó§@nœ[*qY¦Vû(HU¦Ê1 ®ä¡	X–+g(ÄÙÊ
 Ş7¿`¬€b«Á±şşÇÜ Â>‹ëÿ˜ïŸ%`~ĞéË½F!ı_#Xæ¨<†N?;›7X¢›Í~ÿcf€JMÌ0T†XšaåÏïŸ`ÎFv`-}ÿOúûçyğU¡•åŞö-–àv[î•#Lñu"&Ó4J],\·”Ôœ b ­¸.)»,ÔdWRÂ`P\%`ìKJétZ’”} ¬ ¤½n )[X‹-I	º¸Ç{¡s×^T•´½	`²'iÕ-D0‚^ü^ÒÖZÈ]kMÒŞÇĞq —4@?H¥\µ+òpøÿ‡½;nq	ã8şÀ"b£ÊF¡‹ˆ²QR˜*BªŠSPø½ÿ·pÊÊ¹[;İ™LÚ¤ô÷ùïààö˜Ù4ß§É,o ö-…“È5÷^£3¯ïÉ5‰Á%>´WpÛ/¾¡ß^Ü–m¿şœ ìß^L*¾G ÷OeCj ğ°ÏA;Ë†û¯¾ µ/¯îË†X o D­àéBÉ¦Ço¿¢…¯oË&5ƒ§×?H¼†'“+ùÇƒ—5¼Ô/È?TnàiÍ¯€%ğfÆ²Å'o>ÂÉÇ7OîÈ%[úó+ÀÃÉà¯+ÙæÖ£çïêŸ°úY¿{şè–l£Æ®àC€=ì ß›»Ÿåoæ>}şş ~|ÿüéÃüMşìá]±Q¹×¿/Z™ÅÒ‘xpıo`9VL—àú÷¬DKfv&AÎfø‹ÀŞdÀá÷€:› üı‚!ô$OñDàúF†0¦šŒÄÑhR€ëß“(³ì€pz–”ì FùL#œåÏ¸(‘Ê6ÉİXê‹|2ıİ
ê×?Lò½„ÿùoÆ/]$€‰e›x…£°²üø††¸Ğ°î UãÔÊºşĞBN7{FÉ6jÁ+mëÏ›CªÙxësC+äšÍwH>°[ìŞé¶NlëÏù “Èà¦Õ¬:ºiıa˜‚nCûPå‘}ü‹ZòQ7‰ıô‡á¬S±­?ßp¤á¶¢gÉv±Á_LÁ]2ëKŸÃ¯B¬ëÏ7…İp“‰Å"®1 uì¾şh„œ«Mjÿ××ˆu!6©á£"	¸)øÀ"òüÛpäóÜW.VÙ½[gb5ãë‚îØÌ”Ø¨=+”Ø¨Šï‹xĞ;´ŠæèÑ<§üg
†œa±Kjôd±óÇ2<4ÊGƒ&²C¶BV™ìã*¦`ğa 3å¾ú_~Uñ­/Êøgßı/¿Ä®`
vôêÏDvJ‡ıì·›ğäO1œh%;Å% Œd'Uñè _Úï(;u¾Â^­Î•\rş2¤şG Ù%%ö¦LäªâùÁş¸kR¹‰ÊæØƒy¦Dü~ı™‚û=ÒN×èT½}õy‚d7	èÇLÄA”Í×èÄzEâ`lpSĞM	o:'É´F zš8ş·– ÀCD»N@û`ĞJ§´´˜¦JÜD3 <E®VL.î’¢¬áeQ‰¸Ë®c
$`PØÅi1_¬qƒõb^¤±xÙ<BJÆCƒöt"şâ$+ŠéâüoñË´(²$¯¦ _†m%:üP3èd`ËÏôQ"œ>“œi„›2ƒ5%§&:1Ã™‹H*šüƒ)è)E‡ª³]ûùGÅœ4èTsõwh%SĞß9:·«^6.S°‡´¨ÆêĞï01[™b_ô$:à­+S°û´ÌG‡iW¦`[ûVMâ}¯˜‚­%8Så#%­Eg¹N­W.¦`ˆÓ´ÙÑ(¯ ke¹ 0{HÀ FWùØe¨Ñ8¯4ğGak¦``öDkçùè·HşˆG¿åù…Ö6(Ë÷×LÁ S‰R6\b
†ˆp,"Ë˜)DãH,l÷®LÁ	Ebùş’)¤Á‘¨m—.¦`X‹Ìvéb
†%à‘XÙ¦ÀLÁ“H@œÛâ…)x
	hŸ3O"ı§Àá*&à€D–)0Sğ$e7¯K&à±OùwçoH@Nw2Š/CÒÙ€'G]M@NO9+p
|£Š	8Ä)ğ—˜‚–àø”S0§ÀN2&àà¦Àøƒ)Ø^NLÀN™‚íUàØYÅä˜)’€œ{X2ûSÛ6/S0$9öb°'+Û×@LÁ“H@¶)ØZN½ULÀ^Lm ¦`@r
Ü‚fi
Ì<‰D< Ç˜ÅÌ˜)€œ·d"&`ÏC ½*™€Ã˜3[Óà8€fRa;œ)Ø’jÀ)p`
2ûŸ3[ŠId9Íˆ)ØV	Nƒ•LÀ‰-Ÿ_LÁ¶48î€fö:f
¶O@N;JA&`S`¦`ûä¸³dî[a» 0[' §ÀİI˜€ûUÚ¦ÀLÁÿØ;C¹a €dh¸R˜™Ñ!³¥f'ÕdIÍüÿ¿P•”ô|ºMâÑ8~ïÒ*ç½É&^"›ï, ¤àád
|q
’€Ù:ÿ~Rp‰låÍí!y]ø^	ØBÇ`HÁÃ	Èøz$à bg{HRp¬³üv…±?fkQI)ğ /kNIÁƒ	Èxå|´ÉÈ½ƒ“‚)ğÊ)Úd”Â‚)ğP~“€:S`Rp‰l±³ ‚)ğp2	8~
L
®‘€Õu¶‡$& S`	8x
L
.‘€í³· ‚Ç)°Z
’€#§À¤à	Øâg?™	ÈX‘_$ ú˜×…ï•€Õu6¶!% S`e>HÀs¸Ä‚x6¦Àê<ÙfÄ˜\"Û§t’‚ï³µùØ:ÿ	Rp‰lEş£´¿‚ïóÑæ#vŞi&×HÀ]¾`o­‘‚K$`‹•Œ\#«“/pµ‘‚K$`K½y6)h 9wz‹Ù§€¹[LÖûQSõ'Iz÷MÏNq»Şª\.ÏM8OĞ nËå,ò/Ğ ^ïÃû´HÒ»-ï IT{~òŞÛ«“oq´HQ[–h¯öğÄc€&Ij/UfĞ¦j==õà}=°È( IŠÖiÙ0À»zàK~Ä4IÒÚ~5b€F=PKÌvĞ$AëWôà=°:ù!®b€&ñZ7æ„Ú$)ı„Şc€÷óÀ,o1@›¥whàİ<°¼yĞ&^éÂÜ0À{yàKŞdÇ oåQŞ$b€F	J'fÇ Rt¾¥’0Àûx`uò6®b€FI:_Ryb€·ñ@/ğ U‚Î+´JQÙjóŞÃ‹¤`€VI*Kó†Úõ@7Û1Àx`”ÃDĞ,EåÒÜ1@«x•{sÂ g÷Àêä®b€“{àSNñÄ '÷@/§ğ ]ŠÆ6ÛœÚr’8³9MÁ 'öÀMN0@»s³c€Óz`”ˆ ]¼Æâ\1@»$;KàœXİEÇ¨ ]‚Â®Š4L¿©¢Ç gôÀ,—‘1@Ã¤ñ«ó†ÎçE.¤`€Óy`¸ô eÊø«sÇ 'óÀ(—1À¹<°ÊÅTĞ´?;	œÉ«“‹qœÈ³\NÆ 'ò@?àà<˜e œÆ7À†ÎâE†P0ÀI<0Èh?|}Ş1À)<0Ê "8ƒVFÅ MF_Ÿ	´ïÕÉ0hß³$c€æ=ĞË@üŸvë˜  *øæeş¡ÂÑª¨^àQe€·½ŒQi€               À¶-ê„]Z    IEND®B`‚                                                                                                                                                                                                                                       
$lang['email_no_from'] = 'Cannot send mail with no "From" header.';
$lang['email_no_recipients'] = 'You must include recipients: To, Cc, or Bcc';
$lang['email_send_failure_phpmail'] = 'Unable to send email using PHP mail(). Your server might not be configured to send mail using this method.';
$lang['email_send_failure_sendmail'] = 'Unable to send email using PHP Sendmail. Your server might not be configured to send mail using this method.';
$lang['email_send_failure_smtp'] = 'Unable to send email using PHP SMTP. Your server might not be configured to send mail using this method.';
$lang['email_sent'] = 'Your message has been successfully sent using the following protocol: %s';
$lang['email_no_socket'] = 'Unable to open a socket to Sendmail. Please check settings.';
$lang['email_no_hostname'] = 'You did not specify a SMTP hostname.';
$lang['email_smtp_error'] = 'The following SMTP error was encountered: %s';
$lang['email_no_smtp_unpw'] = 'Error: You must assign a SMTP username and password.';
$lang['email_failed_smtp_login'] = 'Failed to send AUTH LOGIN command. Error: %s';
$lang['email_smtp_auth_un'] = 'Failed to authenticate username. Error: %s';
$lang['email_smtp_auth_pw'] = 'Failed to authenticate password. Error: %s';
$lang['email_smtp_data_failure'] = 'Unable to send data: %s';
$lang['email_exit_status'] = 'Exit status code: %s';
                                                                                                                                                                                  group-prepend>.form-control-plaintext.input-group-text{padding-right:0;padding-left:0}.form-control-sm,.input-group-sm>.form-control,.input-group-sm>.input-group-append>.btn,.input-group-sm>.input-group-append>.input-group-text,.input-group-sm>.input-group-prepend>.btn,.input-group-sm>.input-group-prepend>.input-group-text{padding:.25rem .5rem;font-size:.765625rem;line-height:1.5}.input-group-sm>.input-group-append>select.btn:not([size]):not([multiple]),.input-group-sm>.input-group-append>select.input-groupï»¿/*
 Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.plugins.setLang("a11yhelp","si",{title:"à·…à¶Ÿà· à·€à·’à¶ºà·„à·à¶šà·’ ",contents:"à¶‹à¶¯à·€à·Š à·ƒà¶³à·„à· à¶…à¶±à·Šà¶­à¶»à·Šà¶œà¶­à¶º.à¶±à·’à¶šà·Šà¶¸à¶ºà·™à¶¸à¶§ ESC à¶¶à·œà¶­à·Šà¶­à¶¸ à¶”à¶¶à¶±à·Šà¶±",legend:[{name:"à¶´à·œà¶¯à·” à¶šà¶»à·”à¶«à·”",items:[{name:"à·ƒà¶‚à·ƒà·Šà¶šà¶»à¶« à¶¸à·™à·€à¶½à¶¸à·Š ",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à¶…à·€à¶°à·à¶±à¶º} à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·”à·€à·š à¶‘à·„à· à¶¸à·™à·„à· à¶ºà·‘à¶¸à¶§.à¶‰à¶¯à·’à¶»à·’à¶ºà¶§ à¶ºà·‘à¶¸à¶§ à·„à· à¶†à¶´à·ƒà·” à¶ºà·‘à¶¸à¶§ à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·”à¶šà·à¶«à·Šà¶©à¶º à·„à· TAB à·„à· SHIFT-TAB .à¶‰à¶¯à·’à¶»à·’à¶ºà¶§ à¶ºà·‘à¶¸à¶§ à·„à· à¶†à¶´à·ƒà·” à¶ºà·‘à¶¸à¶§ à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à¶¶à·œà¶­à·Šà¶­à¶¸ à·ƒà¶¸à¶œ RIGHT ARROW à·„à· LEFT ARROW.à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à¶¶à·œà¶­à·Šà¶­à¶¸ à·ƒà¶šà·Šâ€à¶»à·’à¶º à¶šà¶» à¶œà·à¶±à·“à¶¸à¶§  SPACE à·„à·  ENTER à¶¶à·œà¶­à·Šà¶­à¶¸ à¶”à¶¶à¶±à·Šà¶±."},{name:"à·ƒà¶‚à·ƒà·Šà¶šà¶»à¶« ",legend:"à¶¯à·™à¶¶à·ƒà¶šà·Š à¶­à·”à·…, à¶Šà·…à¶Ÿ à¶¯à·™à¶¶à·ƒà·Š à¶´à·™à¶¯à·™à·ƒà¶§ à¶ºà·‘à¶¸à¶§ TAB à¶¶à·œà¶­à·Šà¶­à¶¸ à¶”à¶¶à¶±à·Šà¶±, à¶šà¶½à·’à¶±à·Š à¶´à·™à¶¯à·™à·ƒà¶§ à¶ºà·‘à¶¸à¶§ SHIFT + TAB à¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯, à¶¯à·™à¶¶à·ƒà·Š à¶‰à¶¯à·’à¶»à·’à¶´à¶­à·Š à¶šà·’à¶»à·“à¶¸à¶§ ENTER à¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯, à¶¯à·™à¶¶à·ƒà·Š à¶±à·à·€à¶­à·“à¶¸à¶§  ESCà¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯, à¶¯à·™à¶¶à·ƒà·Š à·ƒà·„à·’à¶­ à¶œà·œà¶±à·”, à¶´à·’à¶§à·” à·€à·à¶©à·’ à·ƒà¶‚à¶šà·Šâ€à¶ºà¶ºà·à·€à¶šà·Š à¶½à¶¶à· à¶œà·™à¶±à·’à¶¸à¶§,à¶œà·œà¶±à·” à¶­à·”à·… à¶‘à·„à·à¶¸à·™à·„à· à¶ºà·‘à¶¸à¶§ ALT + F10 à¶¶à·œà¶­à·Šà¶­à¶¸à·Š à¶¯, à¶Šà·…à¶Ÿ à¶œà·œà¶±à·”à·€à¶§ à¶ºà·‘à¶¸à¶§ TAB à·„à· RIGTH ARROW à¶¶à·œà¶­à·Šà¶­à¶¸ à¶”à¶¶à¶±à·Šà¶±. à¶´à·™à¶» à¶œà·œà¶±à·”à·€à¶§ à¶ºà·‘à¶¸à¶§ SHIFT + TAB à·„à· LEFT ARROW à¶¶à·œà¶­à·Šà¶­à¶¸à·Š à¶¯ ,à¶œà·œà¶±à·” à¶´à·’à¶§à·” à¶­à·šà¶»à·“à¶¸à¶§  SPACE à·„à· ENTER à¶¶à·œà¶­à·Šà¶­à¶¸à·Š à¶¯ à¶”à¶¶à¶±à·Šà¶±."},
{name:"à·ƒà¶‚à·ƒà·Šà¶šà¶»à¶« à¶…à¶©à¶‚à¶œà·”à·€à¶§ ",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶…à¶±à·Šà¶­à¶»à·Šà¶œà¶­ à¶¸à·™à¶±à·”à·€} à·„à·  APPLICATION KEY  à¶…à¶±à·Šà¶­à¶»à·Šà¶œà¶­-à¶¸à·™à¶±à·”à·€ à·€à·’à·€à·”à¶»à¶­à¶šà·’à¶»à·“à¶¸à¶§. à¶Šà·…à¶Ÿ à¶¸à·™à¶±à·”à·€-à·€à·Šà¶šà¶½à·Šà¶´à¶ºà¶±à·Šà¶§ à¶ºà·‘à¶¸à¶§ TAB à·„à· DOWN ARROW à¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯, à¶´à·™à¶» à·€à·’à¶šà¶½à·Šà¶´à¶ºà¶±à·Šà¶§à¶ºà·‘à¶¸à¶§ SHIFT+TAB à·„à·  UP ARROW à¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯, à¶¸à·™à¶±à·”à·€-à·€à·Šà¶šà¶½à·Šà¶´à¶ºà¶±à·Š à¶­à·šà¶»à·“à¶¸à¶§ SPACE à·„à· ENTER à¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯,  à¶¯à·à¶±à¶§ à·€à·’à·€à·”à¶»à·Šà¶­à·€ à¶‡à¶­à·’ à¶‹à¶´-à¶¸à·™à¶±à·”à·€à¶š à·€à·“à¶šà¶½à·Šà¶´ à¶­à·šà¶»à·“à¶¸à¶§ SPACE à·„à· ENTER à·„à· RIGHT ARROW à¶¯, à¶±à·à·€à¶­ à¶´à·™à¶» à¶´à·Šâ€à¶»à¶°à·à¶± à¶¸à·™à¶±à·”à·€à¶§ à¶ºà·‘à¶¸à¶§  ESC à·„à· LEFT ARROW à¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯.  à¶…à¶±à·Šà¶­à¶»à·Šà¶œà¶­-à¶¸à·™à¶±à·”à·€ à·€à·à·ƒà·“à¶¸à¶§  ESC à¶¶à·œà¶­à·Šà¶­à¶¸ à¶¯ à¶”à¶¶à¶±à·Šà¶±."},{name:"à·ƒà¶‚à·ƒà·Šà¶šà¶»à¶« à¶­à·šà¶»à·”à¶¸à·Š ",legend:"à¶­à·šà¶»à·”à¶¸à·Š à¶šà·œà¶§à·”à·€ à¶­à·”à·… , à¶Šà·…à¶Ÿ à¶…à¶ºà·’à¶­à¶¸à¶ºà¶§ à¶ºà·‘à¶¸à¶§ TAB à·„à· DOWN ARROW , à¶´à·™à¶» à¶…à¶ºà·’à¶­à¶¸à¶ºà¶§ à¶ºà·‘à¶¸à¶§  SHIFT + TAB à·„à· UP ARROW . à¶…à¶ºà·’à¶­à¶¸ à·€à·’à¶šà¶½à·Šà¶´à¶ºà¶±à·Š à¶­à·šà¶»à·“à¶¸à¶§  SPACE à·„à·  ENTER ,à¶­à·šà¶»à·”à¶¸à·Š à¶šà·œà¶§à·”à·€ à·€à·à·ƒà·“à¶¸à¶§ ESC à¶¶à·œà¶­à·Šà¶­à¶¸à·Š à¶¯ à¶”à¶¶à¶±à·Šà¶±."},
{name:"à·ƒà¶‚à·ƒà·Šà¶šà¶»à¶« à¶…à¶‚à¶œ à·ƒà·„à·’à¶­ ",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à¶…à·€à¶°à·à¶±à¶º} à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·”à·€à·š à¶‘à·„à· à¶¸à·™à·„à· à¶ºà·‘à¶¸à¶§.à¶‰à¶¯à·’à¶»à·’à¶ºà¶§ à¶ºà·‘à¶¸à¶§ à·„à· à¶†à¶´à·ƒà·” à¶ºà·‘à¶¸à¶§ à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·”à¶šà·à¶«à·Šà¶©à¶º à·„à· TAB à·„à· SHIFT-TAB .à¶‰à¶¯à·’à¶»à·’à¶ºà¶§ à¶ºà·‘à¶¸à¶§ à·„à· à¶†à¶´à·ƒà·” à¶ºà·‘à¶¸à¶§ à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à¶¶à·œà¶­à·Šà¶­à¶¸ à·ƒà¶¸à¶œ RIGHT ARROW à·„à· LEFT ARROW.à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à¶¶à·œà¶­à·Šà¶­à¶¸ à·ƒà¶šà·Šâ€à¶»à·’à¶º à¶šà¶» à¶œà·à¶±à·“à¶¸à¶§  SPACE à·„à·  ENTER à¶¶à·œà¶­à·Šà¶­à¶¸ à¶”à¶¶à¶±à·Šà¶±."}]},{name:"à·€à·’à¶°à·à¶±",items:[{name:"à·€à·’à¶°à·à¶±à¶º à·€à·™à¶±à·ƒà·Š ",legend:"à¶”à¶¶à¶±à·Šà¶± ${à·€à·™à¶±à·ƒà·Š à¶šà·’à¶»à·“à¶¸}"},{name:"à·€à·’à¶°à·à¶± à¶±à·à·€à¶­à·Š à¶´à·™à¶» à¶´à¶»à·’à¶¯à·’à¶¸ à·€à·™à¶±à·ƒà·Šà¶šà¶» à¶œà·à¶±à·“à¶¸.",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶±à·à·€à¶­à·Š à¶´à·™à¶» à¶´à¶»à·’à¶¯à·’à¶¸ à·€à·™à¶±à·ƒà·Šà¶šà¶» à¶œà·à¶±à·“à¶¸}"},{name:"à¶­à¶¯ à¶…à¶šà·”à¶»à·’à¶±à·Š à·€à·’à¶°à·à¶±",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶­à¶¯ }"},
{name:"à¶¶à·à¶°à·“ à¶…à¶šà·”à¶»à·” à·€à·’à¶°à·à¶±",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶¶à·à¶°à·“ à¶…à¶šà·”à¶»à·” }"},{name:"à¶ºà¶§à·’à¶±à·Š à¶‰à¶»à·’ à¶‡à¶¯ à¶‡à¶­à·’ à·€à·’à¶°à·à¶±.",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶ºà¶§à·’à¶±à·Š à¶‰à¶»à·’ à¶‡à¶¯ à¶‡à¶­à·’}"},{name:"à·ƒà¶¸à·Šà¶¶à¶±à·Šà¶°à·’à¶­ à·€à·’à¶°à·à¶±",legend:"à¶”à¶¶à¶±à·Šà¶± ${à·ƒà¶¸à·Šà¶¶à¶±à·Šà¶° }"},{name:"à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à·„à·à¶šà·”à¶½à·”à¶¸à·Š à·€à·’à¶°à·à¶±",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶¸à·™à·€à¶½à¶¸à·Š à¶­à·“à¶»à·” à·„à·à¶šà·”à¶½à·”à¶¸à·Š }"},{name:"à¶ºà·œà¶¸à·”à·€à·“à¶¸à¶§ à¶´à·™à¶»  à·€à·à¶¯à¶œà¶­à·Š  à·€à·’à¶°à·à¶±",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶ºà·œà¶¸à·”à·€à·“à¶¸à¶§ à¶Šà·…à¶Ÿ }"},{name:"à¶ºà·œà¶¸à·”à·€à·“à¶¸à¶§ à¶Šà·…à¶œ à·€à·à¶¯à¶œà¶­à·Š  à·€à·’à¶°à·à¶±",legend:"à¶”à¶¶à¶±à·Šà¶± ${à¶ºà·œà¶¸à·”à·€à·“à¶¸à¶§ à¶Šà·…à¶Ÿ }"},{name:"à¶´à·Šâ€à¶»à·€à·šà· ",legend:"à¶”à¶¶à¶±à·Šà¶±  ${a11y }"}]}]});                                                                                                                                                                                                                                icense	http://opensource.org/licenses/MIT	MIT License
 * @link	http://codeigniter.com
 * @since	Version 3.0.0
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * CodeIgniter Wincache Caching Class
 *
 * Read more about Wincache functions here:
 * http://www.php.net/manual/en/ref.wincache.php
 *
 * @package		CodeIgniter
 * @subpackage	Libraries
 * @category	Core
 * @author		Mike Murkovic
 * @link
 */
class CI_Cache_wincache extends CI_Driver {

	/**
	 * Get
	 *
	 * Look for a value in the cache. If it exists, return the data,
	 * if not, return FALSE
	 *
	 * @param	string	$id	Cache Ide
	 * @return	mixed	Value that is stored/FALSE on failure
	 */
	public function get($id)
	{
		$success = FALSE;
		$data = wincache_ucache_get($id, $success);

		// Success returned by reference from wincache_ucache_get()
		return ($success) ? $data : FALSE;
	}

	// ------------------------------------------------------------------------

	/**
	 * Cache Save
	 *
	 * @param	string	$id	Cache ID
	 * @param	mixed	$data	Data to store
	 * @param	int	$ttl	Time to live (in seconds)
	 * @param	bool	$raw	Whether to store the raw value (unused)
	 * @return	bool	true on success/false on failure
	 */
	public function save($id, $data, $ttl = 60, $raw = FALSE)
	{
		return wincache_ucache_set($id, $data, $ttl);
	}

	// ------------------------------------------------------------------------

	/**
	 * Delete from Cache
	 *
	 * @param	mixed	unique identifier of the item in the cache
	 * @return	bool	true on success/false on failure
	 */
	public function delete($id)
	{
		return wincache_ucache_delete($id);
	}

	// ------------------------------------------------------------------------

	/**
	 * Increment a raw value
	 *
	 * @param	string	$id	Cache ID
	 * @param	int	$offset	Step/value to add
	 * @return	mixed	New value on success or FALSE on failure
	 */
	public function increment($id, $offset = 1)
	{
		$success = FALSE;
		$value = wincache_ucache_inc($id, $offset, $success);

		return ($success === TRUE) ? $value : FALSE;
	}

	// ------------------------------------------------------------------------

	/**
	 * Decrement a raw value
	 *
	 * @param	string	$id	Cache ID
	 * @param	int	$offset	Step/value to reduce by
	 * @return	mixed	New value on success or FALSE on failure
	 */
	public function decrement($id, $offset = 1)
	{
		$success = FALSE;
		$value = wincache_ucache_dec($id, $offset, $success);

		return ($success === TRUE) ? $value : FALSE;
	}

	// -----------------------------------------------------------------ï»¿/*
 Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.plugins.setLang("a11yhelp","ru",{title:"Ğ“Ğ¾Ñ€ÑÑ‡Ğ¸Ğµ ĞºĞ»Ğ°Ğ²Ğ¸ÑˆĞ¸",contents:"ĞŸĞ¾Ğ¼Ğ¾Ñ‰ÑŒ. Ğ”Ğ»Ñ Ğ·Ğ°ĞºÑ€Ñ‹Ñ‚Ğ¸Ñ ÑÑ‚Ğ¾Ğ³Ğ¾ Ğ¾ĞºĞ½Ğ° Ğ½Ğ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ESC.",legend:[{name:"ĞÑĞ½Ğ¾Ğ²Ğ½Ğ¾Ğµ",items:[{name:"ĞŸĞ°Ğ½ĞµĞ»ÑŒ Ğ¸Ğ½ÑÑ‚Ñ€ÑƒĞ¼ĞµĞ½Ñ‚Ğ¾Ğ²",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${toolbarFocus} Ğ´Ğ»Ñ Ğ¿ĞµÑ€ĞµÑ…Ğ¾Ğ´Ğ° Ğº Ğ¿Ğ°Ğ½ĞµĞ»Ğ¸ Ğ¸Ğ½ÑÑ‚Ñ€ÑƒĞ¼ĞµĞ½Ñ‚Ğ¾Ğ². Ğ”Ğ»Ñ Ğ¿ĞµÑ€ĞµĞ¼ĞµÑ‰ĞµĞ½Ğ¸Ñ Ğ¼ĞµĞ¶Ğ´Ñƒ Ğ³Ñ€ÑƒĞ¿Ğ¿Ğ°Ğ¼Ğ¸ Ğ¿Ğ°Ğ½ĞµĞ»Ğ¸ Ğ¸Ğ½ÑÑ‚Ñ€ÑƒĞ¼ĞµĞ½Ñ‚Ğ¾Ğ² Ğ¸ÑĞ¿Ğ¾Ğ»ÑŒĞ·ÑƒĞ¹Ñ‚Ğµ TAB Ğ¸ SHIFT-TAB. Ğ”Ğ»Ñ Ğ¿ĞµÑ€ĞµĞ¼ĞµÑ‰ĞµĞ½Ğ¸Ñ Ğ¼ĞµĞ¶Ğ´Ñƒ ĞºĞ½Ğ¾Ğ¿ĞºĞ°Ğ¼Ğ¸ Ğ¿Ğ°Ğ½ĞµĞ»Ğ¸ Ğ¸ÑÑ‚Ñ€ÑƒĞ¼ĞµĞ½Ñ‚Ğ¾Ğ² Ğ¸ÑĞ¿Ğ¾Ğ»ÑŒĞ·ÑƒĞ¹Ñ‚Ğµ ĞºĞ½Ğ¾Ğ¿ĞºĞ¸ Ğ’ĞŸĞ ĞĞ’Ğ Ğ¸Ğ»Ğ¸ Ğ’Ğ›Ğ•Ğ’Ğ. ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ĞŸĞ ĞĞ‘Ğ•Ğ› Ğ¸Ğ»Ğ¸ ENTER Ğ´Ğ»Ñ Ğ·Ğ°Ğ¿ÑƒÑĞºĞ° ĞºĞ½Ğ¾Ğ¿ĞºĞ¸ Ğ¿Ğ°Ğ½ĞµĞ»Ğ¸ Ğ¸Ğ½ÑÑ‚Ñ€ÑƒĞ¼ĞµĞ½Ñ‚Ğ¾Ğ²."},{name:"Ğ”Ğ¸Ğ°Ğ»Ğ¾Ğ³Ğ¸",legend:"Ğ’ Ğ´Ğ¸Ğ°Ğ»Ğ¾Ğ³Ğ¾Ğ²Ğ¾Ğ¼ Ğ¾ĞºĞ½Ğµ, Ğ½Ğ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ĞºĞ»Ğ°Ğ²Ğ¸ÑˆÑƒ TAB Ğ´Ğ»Ñ Ğ¿ĞµÑ€ĞµÑ…Ğ¾Ğ´Ğ° Ğº ÑĞ»ĞµĞ´ÑƒÑÑ‰ĞµĞ¼Ñƒ Ğ´Ğ¸Ğ°Ğ»Ğ¾Ğ³Ğ¾Ğ²Ğ¾Ğ¼Ñƒ Ğ¿Ğ¾Ğ»Ñ, Ğ½Ğ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ĞºĞ»Ğ°Ğ²Ğ¸ÑˆĞ¸ SHIFT + TAB, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ¿ĞµÑ€ĞµĞ¹Ñ‚Ğ¸ Ğº Ğ¿Ñ€ĞµĞ´Ñ‹Ğ´ÑƒÑ‰ĞµĞ¼Ñƒ Ğ¿Ğ¾Ğ»Ñ, Ğ½Ğ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ENTER, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ¾Ñ‚Ğ¿Ñ€Ğ°Ğ²Ğ¸Ñ‚ÑŒ Ğ´Ğ°Ğ½Ğ½Ñ‹Ğµ, Ğ½Ğ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ĞºĞ»Ğ°Ğ²Ğ¸ÑˆÑƒ ESC, Ğ´Ğ»Ñ Ğ¾Ñ‚Ğ¼ĞµĞ½Ñ‹. Ğ”Ğ»Ñ Ğ¾ĞºĞ¾Ğ½, ĞºĞ¾Ñ‚Ğ¾Ñ€Ñ‹Ğµ Ğ¸Ğ¼ĞµÑÑ‚ Ğ½ĞµÑĞºĞ¾Ğ»ÑŒĞºĞ¾ Ğ²ĞºĞ»Ğ°Ğ´Ğ¾Ğº, Ğ½Ğ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ALT + F10 Ğ´Ğ»Ñ Ğ¿ĞµÑ€ĞµÑ…Ğ¾Ğ´Ğ° Ğº ÑĞ¿Ğ¸ÑĞºÑƒ Ğ²ĞºĞ»Ğ°Ğ´Ğ¾Ğº. ĞŸĞµÑ€ĞµÑ…Ğ¾Ğ´ Ğº ÑĞ»ĞµĞ´ÑƒÑÑ‰ĞµĞ¹ Ğ²ĞºĞ»Ğ°Ğ´ĞºĞµ TAB Ğ˜Ğ›Ğ˜ ĞŸĞ ĞĞ’Ğ£Ğ® Ğ¡Ğ¢Ğ Ğ•Ğ›ĞšĞ£. ĞŸĞµÑ€ĞµÑ…Ğ¾Ğ´ Ğº Ğ¿Ñ€ĞµĞ´Ñ‹Ğ´ÑƒÑ‰ĞµĞ¹ Ğ²ĞºĞ»Ğ°Ğ´ĞºĞµ Ñ Ğ¿Ğ¾Ğ¼Ğ¾Ñ‰ÑŒÑ SHIFT + TAB Ğ¸Ğ»Ğ¸ Ğ›Ğ•Ğ’ĞĞ¯ Ğ¡Ğ¢Ğ Ğ•Ğ›ĞšĞ. ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ĞŸĞ ĞĞ‘Ğ•Ğ› Ğ¸Ğ»Ğ¸ ENTER, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ²Ñ‹Ğ±Ñ€Ğ°Ñ‚ÑŒ Ğ²ĞºĞ»Ğ°Ğ´ĞºÑƒ."},
{name:"ĞšĞ¾Ğ½Ñ‚ĞµĞºÑÑ‚Ğ½Ğ¾Ğµ Ğ¼ĞµĞ½Ñ",legend:'ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${contextMenu} Ğ¸Ğ»Ğ¸ ĞºĞ»Ğ°Ğ²Ğ¸ÑˆÑƒ APPLICATION, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ¾Ñ‚ĞºÑ€Ñ‹Ñ‚ÑŒ ĞºĞ¾Ğ½Ñ‚ĞµĞºÑÑ‚Ğ½Ğ¾Ğµ Ğ¼ĞµĞ½Ñ. Ğ—Ğ°Ñ‚ĞµĞ¼ Ğ¿ĞµÑ€ĞµĞ¹Ğ´Ğ¸Ñ‚Ğµ Ğº ÑĞ»ĞµĞ´ÑƒÑÑ‰ĞµĞ¼Ñƒ Ğ¿ÑƒĞ½ĞºÑ‚Ñƒ Ğ¼ĞµĞ½Ñ Ñ Ğ¿Ğ¾Ğ¼Ğ¾Ñ‰ÑŒÑ TAB Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’ĞĞ˜Ğ—". ĞŸĞµÑ€ĞµÑ…Ğ¾Ğ´ Ğº Ğ¿Ñ€ĞµĞ´Ñ‹Ğ´ÑƒÑ‰ĞµĞ¹ Ğ¾Ğ¿Ñ†Ğ¸Ğ¸ - SHIFT+TAB Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’Ğ’Ğ•Ğ Ğ¥". ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ SPACE, Ğ¸Ğ»Ğ¸ ENTER, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ·Ğ°Ğ´ĞµĞ¹ÑÑ‚Ğ²Ğ¾Ğ²Ğ°Ñ‚ÑŒ Ğ¾Ğ¿Ñ†Ğ¸Ñ Ğ¼ĞµĞ½Ñ. ĞÑ‚ĞºÑ€Ñ‹Ñ‚ÑŒ Ğ¿Ğ¾Ğ´Ğ¼ĞµĞ½Ñ Ñ‚ĞµĞºÑƒÑ‰ĞµĞ¹ Ğ¾Ğ¿Ñ†Ğ¸Ğ¸ - SPACE Ğ¸Ğ»Ğ¸ ENTER Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’ĞŸĞ ĞĞ’Ğ". Ğ’Ğ¾Ğ·Ğ²Ñ€Ğ°Ñ‚ Ğº Ñ€Ğ¾Ğ´Ğ¸Ñ‚ĞµĞ»ÑŒÑĞºĞ¾Ğ¼Ñƒ Ğ¿ÑƒĞ½ĞºÑ‚Ñƒ Ğ¼ĞµĞ½Ñ - ESC Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’Ğ›Ğ•Ğ’Ğ". Ğ—Ğ°ĞºÑ€Ñ‹Ñ‚Ğ¸Ğµ ĞºĞ¾Ğ½Ñ‚ĞµĞºÑÑ‚Ğ½Ğ¾Ğ³Ğ¾ Ğ¼ĞµĞ½Ñ - ESC.'},{name:"Ğ ĞµĞ´Ğ°ĞºÑ‚Ğ¾Ñ€ ÑĞ¿Ğ¸ÑĞºĞ°",
legend:'Ğ’Ğ½ÑƒÑ‚Ñ€Ğ¸ Ğ¾ĞºĞ½Ğ° ÑĞ¿Ğ¸ÑĞºĞ°, Ğ¿ĞµÑ€ĞµÑ…Ğ¾Ğ´ Ğº ÑĞ»ĞµĞ´ÑƒÑÑ‰ĞµĞ¼Ñƒ Ğ¿ÑƒĞ½ĞºÑ‚Ñƒ ÑĞ¿Ğ¸ÑĞºĞ° - TAB Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’ĞĞ˜Ğ—". ĞŸĞµÑ€ĞµÑ…Ğ¾Ğ´ Ğº Ğ¿Ñ€ĞµĞ´Ñ‹Ğ´ÑƒÑ‰ĞµĞ¼Ñƒ Ğ¿ÑƒĞ½ĞºÑ‚Ñƒ ÑĞ¿Ğ¸ÑĞºĞ° - SHIFT + TAB Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’Ğ’Ğ•Ğ Ğ¥". ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ SPACE, Ğ¸Ğ»Ğ¸ ENTER, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ·Ğ°Ğ´ĞµĞ¹ÑÑ‚Ğ²Ğ¾Ğ²Ğ°Ñ‚ÑŒ Ğ¾Ğ¿Ñ†Ğ¸Ñ ÑĞ¿Ğ¸ÑĞºĞ°. ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ESC, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ·Ğ°ĞºÑ€Ñ‹Ñ‚ÑŒ Ğ¾ĞºĞ½Ğ¾ ÑĞ¿Ğ¸ÑĞºĞ°.'},{name:"ĞŸÑƒÑ‚ÑŒ Ğº ÑĞ»ĞµĞ¼ĞµĞ½Ñ‚Ñƒ",legend:'ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${elementsPathFocus}, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ¿ĞµÑ€ĞµĞ¹Ñ‚Ğ¸ Ğº Ğ¿Ğ°Ğ½ĞµĞ»Ğ¸ Ğ¿ÑƒÑ‚Ğ¸ ÑĞ»ĞµĞ¼ĞµĞ½Ñ‚Ğ¾Ğ². ĞŸĞµÑ€ĞµÑ…Ğ¾Ğ´ Ğº ÑĞ»ĞµĞ´ÑƒÑÑ‰ĞµĞ¹ ĞºĞ½Ğ¾Ğ¿ĞºĞµ ÑĞ»ĞµĞ¼ĞµĞ½Ñ‚Ğ° - TAB Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’ĞŸĞ ĞĞ’Ğ". ĞŸĞµÑ€ĞµÑ…Ğ¾Ğ´ Ğº Ğ¿Ñ€ĞµĞ´Ñ‹Ğ´ÑƒÑ‰ĞµĞ¹ ĞºĞ½Ğ¾Ğ¿ĞºÑƒ - SHIFT+TAB Ğ¸Ğ»Ğ¸ ÑÑ‚Ñ€ĞµĞ»ĞºĞ¾Ğ¹ "Ğ’Ğ›Ğ•Ğ’Ğ". ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ SPACE, Ğ¸Ğ»Ğ¸ ENTER, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ²Ñ‹Ğ±Ñ€Ğ°Ñ‚ÑŒ ÑĞ»ĞµĞ¼ĞµĞ½Ñ‚ Ğ² Ñ€ĞµĞ´Ğ°ĞºÑ‚Ğ¾Ñ€Ğµ.'}]},
{name:"ĞšĞ¾Ğ¼Ğ°Ğ½Ğ´Ñ‹",items:[{name:"ĞÑ‚Ğ¼ĞµĞ½Ğ¸Ñ‚ÑŒ",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${undo}"},{name:"ĞŸĞ¾Ğ²Ñ‚Ğ¾Ñ€Ğ¸Ñ‚ÑŒ",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${redo}"},{name:"ĞŸĞ¾Ğ»ÑƒĞ¶Ğ¸Ñ€Ğ½Ñ‹Ğ¹",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${bold}"},{name:"ĞšÑƒÑ€ÑĞ¸Ğ²",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${italic}"},{name:"ĞŸĞ¾Ğ´Ñ‡ĞµÑ€ĞºĞ½ÑƒÑ‚Ñ‹Ğ¹",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${underline}"},{name:"Ğ“Ğ¸Ğ¿ĞµÑ€ÑÑÑ‹Ğ»ĞºĞ°",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${link}"},{name:"Ğ¡Ğ²ĞµÑ€Ğ½ÑƒÑ‚ÑŒ Ğ¿Ğ°Ğ½ĞµĞ»ÑŒ Ğ¸Ğ½ÑÑ‚Ñ€ÑƒĞ¼ĞµĞ½Ñ‚Ğ¾Ğ²",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${toolbarCollapse}"},{name:"ĞšĞ¾Ğ¼Ğ°Ğ½Ğ´Ñ‹ Ğ´Ğ¾ÑÑ‚ÑƒĞ¿Ğ° Ğº Ğ¿Ñ€ĞµĞ´Ñ‹Ğ´ÑƒÑ‰ĞµĞ¼Ñƒ Ñ„Ğ¾ĞºÑƒÑĞ½Ğ¾Ğ¼Ñƒ Ğ¿Ñ€Ğ¾ÑÑ‚Ñ€Ğ°Ğ½ÑÑ‚Ğ²Ñƒ",legend:'ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${accessPreviousSpace}, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ¾Ğ±Ñ€Ğ°Ñ‚Ğ¸Ñ‚ÑŒÑÑ Ğº Ğ±Ğ»Ğ¸Ğ¶Ğ°Ğ¹ÑˆĞµĞ¼Ñƒ Ğ½ĞµĞ´Ğ¾ÑÑ‚Ğ¸Ğ¶Ğ¸Ğ¼Ğ¾Ğ¼Ñƒ Ñ„Ğ¾ĞºÑƒÑĞ½Ğ¾Ğ¼Ñƒ Ğ¿Ñ€Ğ¾ÑÑ‚Ñ€Ğ°Ğ½ÑÑ‚Ğ²Ñƒ Ğ¿ĞµÑ€ĞµĞ´ ÑĞ¸Ğ¼Ğ²Ğ¾Ğ»Ğ¾Ğ¼ "^", Ğ½Ğ°Ğ¿Ñ€Ğ¸Ğ¼ĞµÑ€: Ğ´Ğ²Ğ° ÑĞ¼ĞµĞ¶Ğ½Ñ‹Ñ… HR ÑĞ»ĞµĞ¼ĞµĞ½Ñ‚Ğ°. ĞŸĞ¾Ğ²Ñ‚Ğ¾Ñ€Ğ¸Ñ‚Ğµ ĞºĞ¾Ğ¼Ğ±Ğ¸Ğ½Ğ°Ñ†Ğ¸Ñ ĞºĞ»Ğ°Ğ²Ğ¸Ñˆ, Ñ‡Ñ‚Ğ¾Ğ±Ñ‹ Ğ´Ğ¾ÑÑ‚Ğ¸Ñ‡ÑŒ Ğ¾Ñ‚Ğ´Ğ°Ğ»ĞµĞ½Ğ½Ñ‹Ñ… Ñ„Ğ¾ĞºÑƒÑĞ½Ñ‹Ñ… Ğ¿Ñ€Ğ¾ÑÑ‚Ñ€Ğ°Ğ½ÑÑ‚Ğ².'},
{name:"ĞšĞ¾Ğ¼Ğ°Ğ½Ğ´Ñ‹ Ğ´Ğ¾ÑÑ‚ÑƒĞ¿Ğ° Ğº ÑĞ»ĞµĞ´ÑƒÑÑ‰ĞµĞ¼Ñƒ Ñ„Ğ¾ĞºÑƒÑĞ½Ğ¾Ğ¼Ñƒ Ğ¿Ñ€Ğ¾ÑÑ‚Ñ€Ğ°Ğ½ÑÑ‚Ğ²Ñƒ",legend:"Press ${accessNextSpace} to access the closest unreachable focus space after the caret, for example: two adjacent HR elements. Repeat the key combination to reach distant focus spaces."},{name:"Ğ¡Ğ¿Ñ€Ğ°Ğ²ĞºĞ° Ğ¿Ğ¾ Ğ³Ğ¾Ñ€ÑÑ‡Ğ¸Ğ¼ ĞºĞ»Ğ°Ğ²Ğ¸ÑˆĞ°Ğ¼",legend:"ĞĞ°Ğ¶Ğ¼Ğ¸Ñ‚Ğµ ${a11yHelp}"}]}]});                                                                                                                                                                 IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @package	CodeIgniter
 * @author	EllisLab Dev Team
 * @copyright	Copyright (c) 2008 - 2014, EllisLab, Inc. (http://ellislab.com/)
 * @copyright	Copyright (c) 2014 - 2015, British Columbia Institute of Technology (http://bcit.ca/)
 * @license	http://opensource.org/licenses/MIT	MIT License
 * @link	http://codeigniter.com
 * @since	Version 3.0.0
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * CodeIgniter Redis Caching Class
 *
 * @package	   CodeIgniter
 * @subpackage Libraries
 * @category   Core
 * @author	   Anton Lindqvist <anton@qvister.se>
 * @link
 */
class CI_Cache_redis extends CI_Driver
{
	/**
	 * Default config
	 *
	 * @static
	 * @var	array
	 */
	protected static $_default_config = array(
		'socket_type' => 'tcp',
		'host' => '127.0.0.1',
		'password' => NULL,
		'port' => 6379,
		'timeout' => 0
	);

	/**
	 * Redis connection
	 *
	 * @var	Redis
	 */
	protected $_redis;

	/**
	 * An internal cache for storing keys of serialized values.
	 *
	 * @var	array
	 */
	protected $_serialized = array();

	// ------------------------------------------------------------------------

	/**
	 * Class constructor
	 *
	 * Setup Redis
	 *
	 * Loads Redis config file if present. Will halt execution
	 * if a Redis connection can't be established.
	 *
	 * @return	void
	 * @see		Redis::connect()
	 */
	public function __construct()
	{
		$config = array();
		$CI =& get_instance();

		if ($CI->config->load('redis', TRUE, TRUE))
		{
			$config = $CI->config->item('redis');
		}

		$config = array_merge(self::$_default_config, $config);
		$this->_redis = new Redis();

		try
		{
			if ($config['socket_type'] === 'unix')
			{
				$success = $this->_redis->connect($config['socket']);
			}
			else // tcp socket
			{
				$success = $this->_redis->connect($config['host'], $config['port'], $config['timeout']);
			}

			if ( ! $success)
			{
				log_message('error', 'Cache: Redis connection failed. Check your configuration.');
			}

			if (isset($config['password']) && ! $this->_redis->auth($config['password']))
			{
				log_message('error', 'Cache: Redis authentication failed.');
			}
		}
		catch (RedisException $e)
		{
			log_message('error', 'Cache: Redis connection refused ('.$e->getMessage().')');
		}

		// Initialize the index of serialized values.
		$serialized = $this->_redis->sMembers('_ci_redis_serialized');
		empty($serialized) OR $this->_serialized = array_flip($serialized);
	}

	// ------------------------------------------------------------------------

	/**
	 * Get cache
	 *
	 * @param	string	Cache ID
	 * @return	mixed
	 */
	public function get($key)
	{
		$value = $this->_redis->get($key);

		if ($value !== FALSE && isset($this->_serialized[$key]))
		{
			return unserialize($value);
		}

		return $value;
	}

	// ----<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 1.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * MS SQL Forge Class
 *
 * @category	Database
 * @author		ExpressionEngine Dev Team
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_mssql_forge extends CI_DB_forge {

	/**
	 * Create database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _create_database($name)
	{
		return "CREATE DATABASE ".$name;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _drop_database($name)
	{
		return "DROP DATABASE ".$name;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop Table
	 *
	 * @access	private
	 * @return	bool
	 */
	function _drop_table($table)
	{
		return "DROP TABLE ".$this->db->_escape_identifiers($table);
	}

	// --------------------------------------------------------------------

	/**
	 * Create Table
	 *
	 * @access	private
	 * @param	string	the table name
	 * @param	array	the fields
	 * @param	mixed	primary key(s)
	 * @param	mixed	key(s)
	 * @param	boolean	should 'IF NOT EXISTS' be added to the SQL
	 * @return	bool
	 */
	function _create_table($table, $fields, $primary_keys, $keys, $if_not_exists)
	{
		$sql = 'CREATE TABLE ';

		if ($if_not_exists === TRUE)
		{
			$sql .= 'IF NOT EXISTS ';
		}

		$sql .= $this->db->_escape_identifiers($table)." (";
		$current_field_count = 0;

		foreach ($fields as $field=>$attributes)
		{
			// Numeric field names aren't allowed in databases, so if the key is
			// numeric, we know it was assigned by PHP and the developer manually
			// entered the field information, so we'll simply add it to the list
			if (is_numeric($field))
			{
				$sql .= "\n\t$attributes";
			}
			else
			{
				$attributes = array_change_key_case($attributes, CASE_UPPER);

				$sql .= "\n\t".$this->db->_protect_identifiers($field);

				$sql .=  ' '.$attributes['TYPE'];

				if (array_key_exists('CONSTRAINT', $attributes))
				{
					$sql .= '('.$attributes['CONSTRAINT'].')';
				}

				if (array_key_exists('UNSIGNED', $attributes) && $attributes['UNSIGNED'] === TRUE)
				{
					$sql .= ' UNSIGNED';
				}

				if (array_key_exists('DEFAULT', $attributes))
				{
					$sql .= ' DEFAULT \''.$attributes['DEFAULT'].'\'';
				}

				if (array_key_exists('NULL', $attributes) && $attributes['NULL'] === TRUE)
				{
					$sql .= ' NULL';
				}
				else
				{
					$sql .= ' NOT NULL';
				}

				if (array_key_exists('AUTO_INCREMENT', $attributes) && $attributes['AUTO_INCREMENT'] === TRUE)
				{
					$sql .= ' AUTO_INCREMENT';
				}
			}

			// don't add a comma on the end of the last field
			if (++$current_field_count < count($fields))
			{
				$sql .= ',';
			}
		}

		if (count($primary_keys) > 0)
		{
			$primary_keys = $this->db->_protect_identifiers($primary_keys);
			$sql .= ",\n\tPRIMARY KEY (" . implode(', ', $primary_keys) . ")";
		}

		if (is_array($keys) && count($keys) > 0)
		{
			foreach ($keys as $key)
			{
				if (is_array($key))
				{
					$key = $this->db->_protect_identifiers($key);
				}
				else
				{
					$key = array($this->db->_protect_identifiers($key));
				}

				$sql .= ",\n\tFOREIGN KEY (" . implode(', ', $key) . ")";
			}
		}

		$sql .= "\n)";

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Alter table query
	 *
	 * Generates a platform-specific query so that a table can be altered
	 * Called by add_column(), drop_column(), and column_alter(),
	 *
	 * @access	private
	 * @param	string	the ALTER type (ADD, DROP, CHANGE)
	 * @param	string	the column name
	 * @param	string	the table name
	 * @param	string	the column definition
	 * @param	string	the default value
	 * @param	boolean	should 'NOT NULL' be added
	 * @param	string	the field after which we should add the new field
	 * @return	object
	 */
	function _alter_table($alter_type, $table, $column_name, $column_definition = '', $default_value = '', $null = '', $after_field = '')
	{
		$sql = 'ALTER TABLE '.$this->db->_protect_identifiers($table)." $alter_type ".$this->db->_protect_identifiers($column_name);

		// DROP has everything it needs now.
		if ($alter_type == 'DROP')
		{
			return $sql;
		}

		$sql .= " $column_definition";

		if ($default_value != '')
		{
			$sql .= " DEFAULT \"$default_value\"";
		}

		if ($null === NULL)
		{
			$sql .= ' NULL';
		}
		else
		{
			$sql .= ' NOT NULL';
		}

		if ($after_field != '')
		{
			$sql .= ' AFTER ' . $this->db->_protect_identifiers($after_field);
		}

		return $sql;

	}

	// --------------------------------------------------------------------

	/**
	 * Rename a table
	 *
	 * Generates a platform-specific query so that a table can be renamed
	 *
	 * @access	private
	 * @param	string	the old table name
	 * @param	string	the new table name
	 * @return	string
	 */
	function _rename_table($table_name, $new_table_name)
	{
		// I think this syntax will work, but can find little documentation on renaming tables in MSSQL
		$sql = 'ALTER TABLE '.$this->db->_protect_identifiers($table_name)." RENAME TO ".$this->db->_protect_identifiers($new_table_name);
		return $sql;
	}

}

/* End of file mssql_forge.php */
/* Location: ./system/database/drivers/mssql/mssql_forge.php */                                                                                                                                                                                                                                                                                                                                                                'is_array'	=> $is_array,
			'keys'		=> $indexes,
			'postdata'	=> NULL,
			'error'		=> ''
		);

		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * By default, form validation uses the $_POST array to validate
	 *
	 * If an array is set through this method, then this array will
	 * be used instead of the $_POST array
	 *
	 * Note that if you are validating multiple arrays, then the
	 * reset_validation() function should be called after validating
	 * each array due to the limitations of CI's singleton
	 *
	 * @param	array	$data
	 * @return	CI_Form_validation
	 */
	public function set_data(array $data)
	{
		if ( ! empty($data))
		{
			$this->validation_data = $data;
		}

		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set Error Message
	 *
	 * Lets users set their own error messages on the fly. Note:
	 * The key name has to match the function name that it corresponds to.
	 *
	 * @param	array
	 * @param	string
	 * @return	CI_Form_validation
	 */
	public function set_message($lang, $val = '')
	{
		if ( ! is_array($lang))
		{
			$lang = array($lang => $val);
		}

		$this->_error_messages = array_merge($this->_error_messages, $lang);
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Set The Error Delimiter
	 *
	 * Permits a prefix/suffix to be added to each error message
	 *
	 * @param	string
	 * @param	string
	 * @return	CI_Form_validation
	 */
	public function set_error_delimiters($prefix = '<p>', $suffix = '</p>')
	{
		$this->_error_prefix = $prefix;
		$this->_error_suffix = $suffix;
		return $this;
	}

	// --------------------------------------------------------------------

	/**
	 * Get Error Message
	 *
	 * Gets the error message associated with a particular field
	 *
	 * @param	string	$field	Field name
	 * @param	string	$prefix	HTML start tag
	 * @param 	string	$suffix	HTML end tag
	 * @return	string
	 */
	public function error($field, $prefix = '', $suff<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		Esen Sagynov
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 2.0.2
 * @filesource
 */

// --------------------------------------------------------------------

/**
 * CUBRID Result Class
 *
 * This class extends the parent result class: CI_DB_result
 *
 * @category	Database
 * @author		Esen Sagynov
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_cubrid_result extends CI_DB_result {

	/**
	 * Number of rows in the result set
	 *
	 * @access	public
	 * @return	integer
	 */
	function num_rows()
	{
		return @cubrid_num_rows($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Number of fields in the result set
	 *
	 * @access	public
	 * @return	integer
	 */
	function num_fields()
	{
		return @cubrid_num_fields($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Fetch Field Names
	 *
	 * Generates an array of column names
	 *
	 * @access	public
	 * @return	array
	 */
	function list_fields()
	{
		return cubrid_column_names($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Field data
	 *
	 * Generates an array of objects containing field meta-data
	 *
	 * @access	public
	 * @return	array
	 */
	function field_data()
	{
		$retval = array();

		$tablePrimaryKeys = array();

		while ($field = cubrid_fetch_field($this->result_id))
		{
			$F				= new stdClass();
			$F->name		= $field->name;
			$F->type		= $field->type;
			$F->default		= $field->def;
			$F->max_length	= $field->max_length;

			// At this moment primary_key property is not returned when
			// cubrid_fetch_field is called. The following code will
			// provide a patch for it. primary_key property will be added
			// in the next release.

			// TODO: later version of CUBRID will provide primary_key
			// property.
			// When PK is defined in CUBRID, an index is automatically
			// created in the db_index system table in the form of
			// pk_tblname_fieldname. So the following will count how many
			// columns are there which satisfy this format.
			// The query will search for exact single columns, thus
			// compound PK is not supported.
			$res = cubrid_query($this->conn_id,
				"SELECT COUNT(*) FROM db_index WHERE class_name = '" . $field->table .
				"' AND is_primary_key = 'YES' AND index_name = 'pk_" .
				$field->table . "_" . $field->name . "'"
			);

			if ($res)
			{
				$row = cubrid_fetch_array($res, CUBRID_NUM);
				$F->primary_key = ($row[0] > 0 ? 1 : null);
			}
			else
			{
				$F->primary_key = null;
			}

			if (is_resource($res))
			{
				cubrid_close_request($res);
				$this->result_id = FALSE;
			}

			$retval[] = $F;
		}

		return $retval;
	}

	// --------------------------------------------------------------------

	/**
	 * Free the result
	 *
	 * @return	null
	 */
	function free_result()
	{
		if(is_resource($this->result_id) ||
			get_resource_type($this->result_id) == "Unknown" &&
			preg_match('/Resource id #/', strval($this->result_id)))
		{
			cubrid_close_request($this->result_id);
			$this->result_id = FALSE;
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Data Seek
	 *
	 * Moves the internal pointer to the desired offset. We call
	 * this internally before fetching results to make sure the
	 * result set starts at zero
	 *
	 * @access	private
	 * @return	array
	 */
	function _data_seek($n = 0)
	{
		return cubrid_data_seek($this->result_id, $n);
	}

	// --------------------------------------------------------------------

	/**
	 * Result - associative array
	 *
	 * Returns the result set as an array
	 *
	 * @access	private
	 * @return	array
	 */
	function _fetch_assoc()
	{
		return cubrid_fetch_assoc($this->result_id);
	}

	// --------------------------------------------------------------------

	/**
	 * Result - object
	 *
	 * Returns the result set as an object
	 *
	 * @access	private
	 * @return	object
	 */
	function _fetch_object()
	{
		return cubrid_fetch_object($this->result_id);
	}

}


/* End of file cubrid_result.php */
/* Location: ./system/database/drivers/cubrid/cubrid_result.php */                                                                                                      ring
	 */
	function reduce_multiples($str, $character = ',', $trim = FALSE)
	{
		$str = preg_replace('#'.preg_quote($character, '#').'{2,}#', $character, $str);
		return ($trim === TRUE) ? trim($str, $character) : $str;
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('random_string'))
{
	/**
	 * Create a Random String
	 *
	 * Useful for generating passwords or hashes.
	 *
	 * @param	string	type of random string.  basic, alpha, alnum, numeric, nozero, unique, md5, encrypt and sha1
	 * @param	int	number of characters
	 * @return	string
	 */
	function random_string($type = 'alnum', $len = 8)
	{
		switch ($type)
		{
			case 'basic':
				return mt_rand();
			case 'alnum':
			case 'numeric':
			case 'nozero':
			case 'alpha':
				switch ($type)
				{
					case 'alpha':
						$pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
						break;
					case 'alnum':
						$pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
						break;
					case 'numeric':
						$pool = '0123456789';
						break;
					case 'nozero':
						$pool = '123456789';
						break;
				}
				return substr(str_shuffle(str_repeat($pool, ceil($len / strlen($pool)))), 0, $len);
			case 'unique': // todo: remove in 3.1+
			case 'md5':
				return md5(uniqid(mt_rand()));
			case 'encrypt': // todo: remove in 3.1+
			case 'sha1':
				return sha1(uniqid(mt_rand(), TRUE));
		}
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('increment_string'))
{
	/**
	 * Add's _1 to a string or increment the ending number to allow _2, _3, etc
	 *
	 * @param	string	required
	 * @param	string	What should the duplicate number be appended with
	 * @param	string	Which number should be used for the first dupe increment
	 * @return	string
	 */
	function increment_string($str, $separator = '_', $first = 1)
	{
		preg_match('/(.+)'.preg_quote($separator, '/').'([0-9]+)$/', $str, $match);
		return isset($match[2]) ? $match[1].$separator.($match[2] + 1) : $str.$separator.$first;
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('alternator'))
{
	/**
	 * Alternator
	 *
	 * Allows strings to be alternated. See docs...
	 *
	 * @param	string (as many parameters as needed)
	 * @return	string
	 */
	function alternator($args)
	{
		static $i;

		if (func_num_args() === 0)
		{
			$i = 0;
			return '';
		}
		$args = func_get_args();
		return $args[($i++ % count($args))];
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('repeater'))
{
	/**
	 * Repeater function
	 *
	 * @todo	Remove in version 3.1+.
	 * @deprecated	3.0.0	This is just an alias for PHP's native str_repeat()
	 *
	 * @param	string	$data	String to repeat
	 * @param	int	$num	Number of repeats
	 * @return	string
	 */
	function repeater($data, $num = 1)
	{
		return ($num > 0) ? str_repeat($data, $num) : '';
	}
}
                                                                               p_timeout);

		if ( ! is_resource($this->_smtp_connect))
		{
			$this->_set_error_message('lang:email_smtp_error', $errno.' '.$errstr);
			return FALSE;
		}

		stream_set_timeout($this->_smtp_connect, $this->smtp_timeout);
		$this->_set_error_message($this->_get_smtp_data());

		if ($this->smtp_crypto === 'tls')
		{
			$this->_send_command('hello');
			$this->_send_command('starttls');

			$crypto = stream_socket_enable_crypto($this->_smtp_connect, TRUE, STREAM_CRYPTO_METHOD_TLS_CLIENT);

			if ($crypto !==‰PNG

   IHDR   £   :   Üé   sBIT|dˆ   	pHYs  ×  ×B(›x   tEXtSoftware www.inkscape.org›î<  âIDATxœíy”UÕ•ÿ?ûÜ÷î{5QLÊ ˆ2dp hŒ&Úiˆ‰C3U9Æ^1ILÄZ¶ió3Ñ¬Äv¨I£éhĞ_'ÑNâÔjP EDA¡&j~Ã½g÷¯ªx¯êQThº¾kİu‡wÎ¹gßõ}{Ÿ½Ï>÷ŠªòeÀ¼—8¹ŸUìùÏ7|ËpûXÄõîXwÒ¨=‡»}è>ä‹JFä;ëwiT{šä{VÏò­âYÅ×ÄŞSÅ·	8ÎˆU3†Wî>÷¡{øB‘ñò;3ëkC“ÔúÅ`™o5ÓßK:<M&#m¤ô•?¬ŸsÔE‡»ÿ}è+Á|öií1^Ôã«½Æ³Œ÷•Tí—tÜN#¦ì33ªÜò©Sã‡M˜>tC}ÃkvÔ
øÌŠ«]ìûü“UÅ*ø*XMÎ¶¬í¸İ>yk½VÉ¼w¨åéCÏ¡×ÉxífB9YM}k¿åY®*=› `+™RÈf;'ß¶oIÙ‚õÍùô‘ñKŞ0Óòó‘‘QáLE¯Œ«Nï8ŞëÄô¦Œ÷m–[™Öã¸êmóÑÓÂôáĞ¡GÈx7d8µŞì˜o/õ¬^ì«Ò÷HK¨ÎH×ß1ŒË
2À1¼Óå½úh‡²­m4EÉ­úÚqu=ğ\úpĞ-3- ÷Ôy7‹ÕÛâ6ÕlúÚrœ²ïÜô¶^7(ñ–ãŸÈ±Á¶{>WÕÄ+fº]û®+S»ûPúpxĞ-2ŞSëİè)·%È°'ÃOŞìŞk™¾’br¶Ë”l—~ƒ×}XÅÍ›ªÉ\Sú‡ùö9,Ş{·íéØ¾o¿K¿´8h3]µ^Ô·jº4TÅO2ÓÃƒ†¯d™”dLF#°Ç³¬®‹ò~cŒ¯Ê¤ÀğõŸS·xª ğè¤#ÈsNycMMi_UcUóÇ…%ûğeÃAkÆ<Ç¬š½Ú©£YN1¡c3NÈpbfş-ÚoK³ÇŠŠFVÕEÙØk#ğ††ŸÇÒaıøå'5Ør_·q7Wì×Òvkû	®Š;è…‡qÆØ=øŒúpˆpĞd¬€HN
é:ÆefV€©YAp"Vy·)Î›õ1ÖÔG©ŠùmÚÍo‰9Zï6Äx»>ÊwÌaååµ¬Ï¦Æ8×nØİaœÙ†˜Î~×Ï¦‡İò¦ï¬Š¾à+óÒ™åAáŠ¼Lr¡Ò³¼Õg]cœ1"6İô^ÇY—ã2‚Üs|¹ÓáŞßí¨Ã³Š²×.«òjõÙcO=h¡úpØĞ-2ş¼2v‘§öÑÖ±`+‰¬U~|d&¹á¯{"<U!Ö•i½4¿8p£2|õ©Œ{œ6 “sBœúúV>jŒ%€š:/¤&Äºÿxúp(Ñ-oÚ¨û’ÕH‡Y”áAÃ€€á¿k"<YI;­—|Üßn8f ;¢~VÇÎˆß6ü¸)Î]ŸÔ¤hÍ§2xáä£87/›ß4V':ÓöŸRä8ãwºõdúpÈÑÑş nÌc—o5b[´aë>ÜÒj½ŸÎIvpZÇ†Vá”Ü&ç„øêÀLJ&alf°ÓyéQ>m3?/k¯VLÚ+|£;rõáğ [dTP‹–ùªXö:3•q€%‰xÉ±H›ª!=UŒ@á–jâ
E‡pú€Œ}ÌY'Úz¾²‘éıÃ‰˜d’V@¸ª;rõáğ [d°jMÌºìÕ\ŸÇ|}elØé ÕÒiº7ë" ä—­ßÅ¦Æ8wÏã‚!Ù{guÚúÙÊF"Ì”ÕÒMÖG|~KnweëÃ¡E·É5áuí	æ©²¾)Î	™A M–M»˜äÇÍUqŸ©9!*bKŞıœ•5ÍÜ|ì@ò\§^®j"b•³òdL1×
Ö÷§wW¶>Zt›Œw¥Q•Ú»ßjŒ“a„1á`[ºX:ÍØjªËë¢LËa­Òä[~úa%‚ğãc¦”oãD¬òJU_œ…¤™pQõ/é®l}8´è6|µ÷´7½o7Æ°À¤¬`Ûx¯3§ä…ª&Îœ…UØñøõÖÎ’Íœ™mcÅäáá³•ä¹'å†[/%² ÂÅÒòõáĞ GRÈ®ÙQ?ÖÆìíãˆ?ÙÇpÍ¦ª}§%ÅïŸ8„c3‚Ì_³Ú¸Àß¦À8uåVbVSbŠGexë´ÑÜ±¹’;>ªjcjk™¸	Õ4ÿØO»-`ÆŒ97”Ù¿vŒã­46ö^yyyer™É³fÂÊIFÕsõëO¥kgöìÙÍq™Qq|[Y^şÆ«eee9‘ˆÉJW~/š®ºêª†ésQQÑxgq~şÒ› 
Í°a#/ÌÏ_òÿ¤ŞFhÆİÃs>J6Ñ­)doÖÇrÈ:))dû2Õ·m®¢Ğğ¯£úã«³–mÜÍ±™.×ŒĞ!¸½µ9Î1ÎÊËnëKòØ1€FOÈ7oŞ¼Àä³¯Ÿ2sö¦œ{Ñõˆ>¼d[1eÆìÏ§Î˜UÔZ^,çˆòGEO×Ş´iÓ‚_ŸÑ?‰ò oœ ß×Û‚Agg›ë†8Ğş‹8'7¶6òjĞ'ŠŠœ™\îî»Ï8Ğ¶EEEÁââÒ%EE¥—•YZZ: ¸¸ôª!ã
ğ}å¯6É£¶ª¬©OL‚LÉvÓ/1H
óXU67Å)Û^Ç%ÃrŸåâ+¼ZİÌ;ë¸nô Ê¦Úià™Š¦ä†É:b¢öÊîÊ6mÚÉ§Ô5F×	Ü‰rPú† <	|Ud|WÚcMèTÎ¨7VÏY·úµ·’Š4©rá¾6ĞâîÊšG€,^Õz­¤¤äŸ³³ëşÔİ¶÷‡‚‚‚8Øµªl=Î÷™SVV6L„ó{lŒEK|Õs“‰¶5gwÌgz¿ÿUÑ˜’ecÓ$àZU~ıI5çÉâöqyœ·æS|Unù°’ùyÙüûø!|wí’Ã8ÏT6rí193/‹Gw¤&y[ËLùÛæ~í¸èÁÈ4mÚ¬™Ö˜— ØƒòƒµkV–u,wêQàÙ•6§L?ù~E¿4)rŞ›å+Wµ+/(XÚ«¤X´hÑàß“¯©ÊWC±Ÿ{^<ß#š@5ğjº²ÕõQNÌ
Ú‚×%Ş6x–[?¬djn˜…Ãú°+êñ³Í•œ“—Å9I³. «jš©ó,g·˜ê½¦<q”¥züÁÈ3fÌ¹!+ò 	"n
àŸˆ åå¯l+/½=©:`êŒÙw*’DUíkW¿öòÁôíËU­qv¨òµöÏÆ°ÌúÓŒeÇeW|wcUƒUÍNö’WÕF9oP&'e¹¼²§95Û;Wmş{w/V5qË˜ÁüeW5qŸÒm{¸xx.w?„«‰ø	íèYå*9cPH"	7	bôà­´îıÖŞ¢Êñ€k—¬._ıywÏÔ™³nVäz .è‚µkŞx®;í%£¬¬,ÇZ.TÕIªŒ1†w@ÿn­}­   ©}ùâââ±`®ˆÅ‚·ƒ‘:ç:à$U†•ü@D¼üü¥¿H®wÿı7&~1LR•‘ EôíP(ôÇK/½´1¹ìüÇÃƒ\7şÃ@ÀÜ·xñâ-<Pz¦1œ/"RPPğ¯íºô(ôÓ
} =ÁÖ5D‰Zefn(e^:ıÚ–$ÜôşnrÃOÇ†–ß¯ß°‹‘A®=(%ŒólE#¹AÃŒş-!B&ÊèÁU¿ ÈïËËßxµ;ÏeêôÙW«Ê¿‘X~ñ¾<ìƒAqqñÙ¾¯ïªj1è\­Se®ªüœeeeãÚ×Q5€ï;Íqg2p%0Q„¡"r…ˆ\ä'×))))pœø~¡Ê‰-÷9SUÊ"‘Øú’’’g1Œä×û¾?¤¸¸ôcxô$°îK–]7íÅü'Ô1?HF}åÍú('ç†÷;5˜¬-·4ÅøÍ'5|ÿ˜<²½–µµVïiæwÛkùŞ¨<º£Í	é¹Š8;/›×ªŠ`¯3£Cúÿeı€=_?±¦«rÌ›7/¬p\K;«»óL¦LŸs)Âo EX²nÕÊ´öÁ ¸¸l!˜? Ïæ”Å‹·…±ŠŠŠrÁ¹Ç÷õà·ûjcéÒ¥«QÅÅ¥÷'åç/=¹}™¢¢’ÛEäÇ"”#×-Y²¤¾õ·’’’cTå·ªò|iié7—.]šòGS•…ÀE"zâ²eËŞïL%£3pèÛÑ=»Äb/éVî‰0;7Ì1>hˆu4Ñmy{Û
Üµ¥ŠGæğË	C9óOğnı°‚ó†fó‹	CùæšÄ³ßóY[a~^·|Ú'<'8x¦«rÔ×G&`ÄPõ;}€û‹h‰àû-kW­|¸uÂEE%·¦ÿIŞjunî½÷¡#\WïUåOùùK/l_²   ¸´¸¸ôWÀõ+@IIÉÉ"r“ªæç/ëĞ¯eË–}\XX8wØ°Ï[Ë÷İwß«W^yeòÿûªfj~şâı>Ç5Ó+FĞì«nH&˜¯Êk{š˜Ó?#5…,‰N^Bñ•m¬`R¿‹Gö *îsë‡Ì”É…Gä´•}¦¢‰9!F„ƒB<ÖrÙÈ¡k;§;¯Ûóv´ôeÑŒ3èBWD¥ÛŒ‘SZƒşµª˜@ÀtÖX0èüØ|°¨Ê-Àú;wüÛ¾Ê,_¾Üªú‹€\ÇqóÛı¼º `ñÚ®Ü«GÉ`UîiŸ·¸3ê³©)Îœş©¦:İût 5pı·İ<SÑÀOÆä1Øu@ááOk)ßágã‡Õ²$áéİ‰I‰ùyí&0jö"),ì²¬>ş‡I=Øgø¾5gU£=œ§§M›¶¿ğI]~şÒQé¶eË–´i8&¯,^¼¸¢³Æ-Z‘¿¬ -÷yrùòå^gå


¶‰PŞR¾ªúÇ®Ş«ÇÉH<úl:/ùåšf¾’"Û‘ãÃöI	!ZL83a#Ü6nÈ“¼nÃ.¸êè¨*oÕFXY“Èä¡µ½óÔ&<}áÈ®Š0öè£?"‰ªt)˜½/¼½æÕ9h™dûä¼yóÂİiÀZ&ªê»])«J—ÊµGiié@UèjıD9˜|MDº¼R³ÇÉ8sêÈÓ9%¯nÆÌÑ–JÖ~k7¹Bkp{ksœ»¶TqÑ°~Ì˜±z».ÂúúKFö' ‰¼ùolã?wÔ¦_4­æ«]•aÅŠ>°1q&—œpÂ¼ìN+ìkW½öº$İ>pZmSô±…:İiS„ÆÈğ®”Uµ]*×ıúõ«šºz`8ÈÎÔKvwWï×ãd\Öª<ÑŞT¿S¡&îsÚ€Œ´t2Zu[²¹şÕ–j¶4Åøñ˜Ám×Ş¨ifX8@ët$ ¦š{ÿêDåö–£QÁÌèT7Ş\ıúSŠ\ÙÒ¡onŞº½h?U:ïÊ[Ör2]ÈL‘Ù]h2š™|aÁ‚>ğ.è~ë€é´‹éŠHmîô†™|±¿mï-ÇUy¹º™SfŒÛeŞ´"j•…oîàg›*I"LÌ	á©µ{K§˜gö[ÉòĞK]6k×¼öèc WM™>ç×ãO9%gõ:ÃºÕ¯«ê­-]Z2eÆ¬îü1Æ–””µ § ¨¨ôà¬.´W	2®…Tm‘GUùç¢¢²yU>òÈá?†Z›>9¤+è2FueÇµ.ğBUı†I9á­™Î<§µ”ÙÔceM3a#ÜqüN˜ÉCŸÖRÕ’nÖŞ‹N>S…àà¡D Øk@ßÑïeÆì†©3çÜ:uÆ¬oO™yê¤)3fŸ>eæ¬ë¦Ì˜ıŸSgÎş]isİš×Z´¢Ü4eæ¬ë¤O­((Xò¢÷«ÚŸ•””¥Ÿ-B±*ëö×ˆ~¸GytÊôéŸşxMDW\üàééê•^."7w_~ù’ò—&^yYèÊY#ª§½ñiµU&'A¼\İ„§Ê¼A™¬¬iJ5ÏJZóÜz2"äì!YÌÏËâô™d8†G¶×rÓû»Ro®[÷"z,Ğ¥0ÀªU«ª.\8õ£·O…B`„ª.õ[OXIUº<«2fÔˆ«6²ãĞo ò‹)3gW&Å 3KJJê¬~4üÁÕW_V
¹7D"ñşªúÛââ²áiUÿ}U3JDNóOªzc‹±Ï™ cÌŸ}_Eü—ŠŠJÙÈ}Ë—/¯/**ºXÄù=Ø‹ŠJW£¯ˆÈ6ßçxcøº§>~ÚÕg¶İ©Ü|kïoï-×Ä}Êk#œ“—Å^ê‘vaö€
Çå±ò”Q¼7w4wMÊ¤~aşğYßXı)W­ßÙf¢÷e“wbL—Ç/­X±b…ÿæš•¿260^‘Ğ_O€—AJT¹QÄÜÙVÉšÊúö¾Úô"„?ƒ¾ƒò½IÓçœĞBšªœ´¯{õÕ—U\zé¥ùùK¾òMPQÕ‚yJ„©ªo,û%Hø¸õşÆ¨»\×¶½è`É’%õÆpğˆ\"ÂuÍÍa›Ï>Û~š*×Šp´ªüÜZá rn~ş²Y´hQ¤µ=± ;€sãûB¯½`ş+¯n›j±åíß>ö­#r¸{ÂnßTÉ]'à·v!Ï5œ18‹ùyÙœ18‹Ü€Á*¬­ğLEOW4ğv]4uî™DLœjJÛ
u±&ÍûGÓDiiéÀ¥K—V÷æ=
ÍàÁÇ¸úêËzôs'½FÆ1›7‡;‘öKŒÀªÙ£È9Ü·µ†&Oq0wP&“sÃPïY^¨läéŠF«h "æwHë0>L£“Ìü'ÀôÆ³ovèÃ	½úéq¯l)÷,SÛ¯u9&Óå÷“‡q\–ÛVvScŒg+y¦¢×«›‰«v4áI}İ—VL"bp¿UYÿúøµíg¾€èU2yùã¥µ%-Â³{gZ Æf¹d:†mÍ1*cIqrµïÇ<úO(q‰¼VÿµÉN“õá‹‡^ıô†uô9ßk}Ïw»÷(*|Ğ#÷œîï‘ˆ*ò±ûßÊ_¢ã?Òø½%Kz½JÆ-Ï?²}øœ‹­Oâ·°oï¹ãIGó¬S´Ì*Fu­.˜p@K6ûğÅF¯®mØÿl~Ä³zI²yNN‚è|ìÀ«Öóï×óbÓYãvöışqÑë_ÈòÔ<`Õ»$İ,K:"ªê.ÁÜıSM½¿ñ=Ó‡½èuÍ( ŸÛ´Õ“ 9î×´(©èÃ&^U3·ïÛÑÿWqH¾ª*ãì÷áÍ7¨’ğ–µö>	óì¿ß¦Ë±½Ş‰>|áñ…úŞtşo£»cÆ¶\ºÂÂBY¾|9 ?ş¸ ,X°€—^z)%ß.''§Cşİ–-[ºô¶°Ñ£GwøçÔ××·]›;w®>şx"ƒiÁ‚ÚÒ/–/_:SØ‡/$dÅŠ]Ê8Î<90°ª*Üˆ1n0c\ß7!ÏõE\cMŠßµ"A"D5 UcĞ€Š:ŠqkDDTÅ€M"¦QUUcPU±"ê[+¾ˆõñ<¬x q !®Wˆ©j, qU'fMœ«Æ<Ç‰ºª1Ïó¢ñxf,##İ²eK—_Ò’pÚ‡^@§šqôèÑ&‰„Ãáp(VQò]7Œç…Œã„€°!#„¬1!ÇJH‰JHaÁ¸¢ëªJHÔUWT]… ˆ+h • `PuD¤-“HQCë¸|ÀCl\!.*1EcŠÆŒ!¦*QµÑ(˜˜#D}Õ¨1¾ª1Q jT£ÖÚ¨"®4GÁ‰uÔQÑP(mnnnß¾½Ï{?LØ''NœèÔÔÔ„ÂápÈó¼0¡PØµ6ì	6,"a?l¬	«ØbÂb4ŒJÈª†El$Œ!Œ	£!$¬B«Bi«&M¬»Š¡
D°DŒHD…(ª„¨(T£ªDD$¢ªA«Ø ÆU5è‹ÄÃñ$ÒçLŒ¨šx<.¾Ÿ-#FŒ ‡û$ã{ï½ç1ÂknvÁ W‡ÄKŒ&ö‚uŒ+ªˆˆŠª
‚
‚ª*jP«¨/¨‡bŠ‰*¶I” 	3(jPDDQõ<uãªÄPâ"UÕ˜¢¨‰b4ŠÚ¨ªDElTÕDÅhT¬D-‘¨UI"·/ÄU5®G5nŒñDê<×wº$³½‡NÍt‹†ˆµ›]7äú±PÇõ|'ä8~Èw4d|ãª±!À5®Åº‚ºŠ¸¢¸V%•ÄÕ€1PÅAÅƒ£ŠQÔˆˆ$Ü¢–jÄªªQ«">Š'¢¾¢%à‰jL!nBIŒQ•¸56j¬u«1Ï˜hĞ˜¨ÅbYYYÑêêêhEEEŸssÑ%oºaİ:¯< cÉÌÌ€[WtÑ 8Í®±	¢c\	:ªO5ˆh0 kƒ£UuÆQÔQpÄ`°bT¬ˆvXífÕ`,‚ªª#¾*VD|±âùb}O¬ñ%@\=ñğ[´Ÿ·.qW5&î«ó}777Ç***â=ü,ûĞMü/ãş¤™    IEND®B`‚                                                                                                                                                                                                                                                                                                                                                                                                                               <p>
        &copy; Copyright 2014 - 2017, British Columbia Institute of Technology.
      Last updated on Sep 25, 2017.
    </p>
  </div>

  Built with <a href="http://sphinx-doc.org/">Sphinx</a> using a <a href="https://github.com/snide/sphinx_rtd_theme">theme</a> provided by <a href="https://readthedocs.org">Read the Docs</a>.
  
</footer>
        </div>
      </div>

    </section>

  </div>
  


  

    <script type="text/javascript">
        var DOCUMENTATION_OPTIONS = {
            URL_ROOT:'../',
            VERSION:'3.1.6',
            COLLAPSE_INDEX:false,
            FILE_SUFFIX:'.html',
            HAS_SOURCE:  false
        };
    </script>
      <script type="text/javascript" src="../_static/jquery.js"></script>
      <script type="text/javascript" src="../_static/underscore.js"></script>
      <script type="text/javascript" src="../_static/doctools.js"></script>

  

  
  
    <script type="text/javascript" src="../_static/js/theme.js"></script>
  

  
  
  <script type="text/javascript">
  ï»¿/*
 Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.plugins.setLang("a11yhelp","zh",{title:"è¼”åŠ©å·¥å…·æŒ‡å—",contents:"èªªæ˜å…§å®¹ã€‚è‹¥è¦é—œé–‰æ­¤å°è©±æ¡†è«‹æŒ‰ã€ŒESCã€ã€‚",legend:[{name:"ä¸€èˆ¬",items:[{name:"ç·¨è¼¯å™¨å·¥å…·åˆ—",legend:"è«‹æŒ‰ ${toolbarFocus} ä»¥å°è¦½åˆ°å·¥å…·åˆ—ã€‚åˆ©ç”¨ TAB æˆ– SHIFT+TAB ä»¥ä¾¿ç§»å‹•åˆ°ä¸‹ä¸€å€‹åŠå‰ä¸€å€‹å·¥å…·åˆ—ç¾¤çµ„ã€‚åˆ©ç”¨å³æ–¹å‘éµæˆ–å·¦æ–¹å‘éµä»¥ä¾¿ç§»å‹•åˆ°ä¸‹ä¸€å€‹åŠä¸Šä¸€å€‹å·¥å…·åˆ—æŒ‰éˆ•ã€‚æŒ‰ä¸‹ç©ºç™½éµæˆ– ENTER éµå•Ÿç”¨å·¥å…·åˆ—æŒ‰éˆ•ã€‚"},{name:"ç·¨è¼¯å™¨å°è©±æ–¹å¡Š",legend:"åœ¨å°è©±æ¡†ä¸­ï¼ŒæŒ‰ä¸‹ TAB éµä»¥å°è¦½åˆ°ä¸‹ä¸€å€‹å°è©±æ¡†å…ƒç´ ï¼ŒæŒ‰ä¸‹ SHIFT+TAB ä»¥ç§»å‹•åˆ°ä¸Šä¸€å€‹å°è©±æ¡†å…ƒç´ ï¼ŒæŒ‰ä¸‹ ENTER ä»¥éäº¤å°è©±æ¡†ï¼ŒæŒ‰ä¸‹ ESC ä»¥å–æ¶ˆå°è©±æ¡†ã€‚ç•¶å°è©±æ¡†æœ‰å¤šå€‹åˆ†é æ™‚ï¼Œå¯ä»¥ä½¿ç”¨ ALT+F10 æˆ–æ˜¯åœ¨å°è©±æ¡†åˆ†é é †åºä¸­çš„ä¸€éƒ¨ä»½æŒ‰ä¸‹ TAB ä»¥ä½¿ç”¨åˆ†é åˆ—è¡¨ã€‚ç„¦é»åœ¨åˆ†é åˆ—è¡¨ä¸Šæ™‚ï¼Œåˆ†åˆ¥ä½¿ç”¨å³æ–¹å‘éµåŠå·¦æ–¹å‘éµç§»å‹•åˆ°ä¸‹ä¸€å€‹åŠä¸Šä¸€å€‹åˆ†é ã€‚"},{name:"ç·¨è¼¯å™¨å…§å®¹åŠŸèƒ½è¡¨",legend:"è«‹æŒ‰ä¸‹ã€Œ${contextMenu}ã€æˆ–æ˜¯ã€Œæ‡‰ç”¨ç¨‹å¼éµã€ä»¥é–‹å•Ÿå…§å®¹é¸å–®ã€‚ä»¥ã€ŒTABã€æˆ–æ˜¯ã€Œâ†“ã€éµç§»å‹•åˆ°ä¸‹ä¸€å€‹é¸å–®é¸é …ã€‚ä»¥ã€ŒSHIFT + TABã€æˆ–æ˜¯ã€Œâ†‘ã€éµç§»å‹•åˆ°ä¸Šä¸€å€‹é¸å–®é¸é …ã€‚æŒ‰ä¸‹ã€Œç©ºç™½éµã€æˆ–æ˜¯ã€ŒENTERã€éµä»¥é¸å–é¸å–®é¸é …ã€‚ä»¥ã€Œç©ºç™½éµã€æˆ–ã€ŒENTERã€æˆ–ã€Œâ†’ã€é–‹å•Ÿç›®å‰é¸é …ä¹‹å­é¸å–®ã€‚ä»¥ã€ŒESCã€æˆ–ã€Œâ†ã€å›åˆ°çˆ¶é¸å–®ã€‚ä»¥ã€ŒESCã€éµé—œé–‰å…§å®¹é¸å–®ã€ã€‚"},
{name:"ç·¨è¼¯å™¨æ¸…å–®æ–¹å¡Š",legend:"åœ¨æ¸…å–®æ–¹å¡Šä¸­ï¼Œä½¿ç”¨ TAB æˆ–ä¸‹æ–¹å‘éµç§»å‹•åˆ°ä¸‹ä¸€å€‹åˆ—è¡¨é …ç›®ã€‚ä½¿ç”¨ SHIFT+TAB æˆ–ä¸Šæ–¹å‘éµç§»å‹•åˆ°ä¸Šä¸€å€‹åˆ—è¡¨é …ç›®ã€‚æŒ‰ä¸‹ç©ºç™½éµæˆ– ENTER ä»¥é¸å–åˆ—è¡¨é¸é …ã€‚æŒ‰ä¸‹ ESC ä»¥é—œé–‰æ¸…å–®æ–¹å¡Šã€‚"},{name:"ç·¨è¼¯å™¨å…ƒä»¶è·¯å¾‘å·¥å…·åˆ—",legend:"è«‹æŒ‰ ${elementsPathFocus} ä»¥ç€è¦½å…ƒç´ è·¯å¾‘åˆ—ã€‚åˆ©ç”¨ TAB æˆ–å³æ–¹å‘éµä»¥ä¾¿ç§»å‹•åˆ°ä¸‹ä¸€å€‹å…ƒç´ æŒ‰éˆ•ã€‚åˆ©ç”¨ SHIFT æˆ–å·¦æ–¹å‘éµä»¥ä¾¿ç§»å‹•åˆ°ä¸Šä¸€å€‹æŒ‰éˆ•ã€‚æŒ‰ä¸‹ç©ºç™½éµæˆ– ENTER éµä¾†é¸å–åœ¨ç·¨è¼¯å™¨ä¸­çš„å…ƒç´ ã€‚"}]},{name:"å‘½ä»¤",items:[{name:"å¾©åŸå‘½ä»¤",legend:"è«‹æŒ‰ä¸‹ã€Œ${undo}ã€"},{name:"é‡è¤‡å‘½ä»¤",legend:"è«‹æŒ‰ä¸‹ã€Œ ${redo}ã€"},{name:"ç²—é«”å‘½ä»¤",legend:"è«‹æŒ‰ä¸‹ã€Œ${bold}ã€"},{name:"æ–œé«”",legend:"è«‹æŒ‰ä¸‹ã€Œ${italic}ã€"},{name:"åº•ç·šå‘½ä»¤",legend:"è«‹æŒ‰ä¸‹ã€Œ${underline}ã€"},{name:"é€£çµ",legend:"è«‹æŒ‰ä¸‹ã€Œ${link}ã€"},
{name:"éš±è—å·¥å…·åˆ—",legend:"è«‹æŒ‰ä¸‹ã€Œ${toolbarCollapse}ã€"},{name:"å­˜å–å‰ä¸€å€‹ç„¦é»ç©ºé–“å‘½ä»¤",legend:"è«‹æŒ‰ä¸‹ ${accessPreviousSpace} ä»¥å­˜å–æœ€è¿‘ä½†ç„¡æ³•é è¿‘ä¹‹æ’å­—ç¬¦è™Ÿå‰çš„ç„¦é»ç©ºé–“ã€‚èˆ‰ä¾‹ï¼šäºŒå€‹ç›¸é„°çš„ HR å…ƒç´ ã€‚\r\né‡è¤‡æŒ‰éµä»¥å­˜å–è¼ƒé çš„ç„¦é»ç©ºé–“ã€‚"},{name:"å­˜å–ä¸‹ä¸€å€‹ç„¦é»ç©ºé–“å‘½ä»¤",legend:"è«‹æŒ‰ä¸‹ ${accessNextSpace} ä»¥å­˜å–æœ€è¿‘ä½†ç„¡æ³•é è¿‘ä¹‹æ’å­—ç¬¦è™Ÿå¾Œçš„ç„¦é»ç©ºé–“ã€‚èˆ‰ä¾‹ï¼šäºŒå€‹ç›¸é„°çš„ HR å…ƒç´ ã€‚\r\né‡è¤‡æŒ‰éµä»¥å­˜å–è¼ƒé çš„ç„¦é»ç©ºé–“ã€‚"},{name:"å”åŠ©å·¥å…·èªªæ˜",legend:"è«‹æŒ‰ä¸‹ã€Œ${a11yHelp}ã€"},{name:" Paste as plain text",legend:"Press ${pastetext}",legendEdge:"Press ${pastetext}, followed by ${paste}"}]}],tab:"Tab",pause:"Pause",capslock:"Caps Lock",escape:"Esc",pageUp:"Page Up",
pageDown:"Page Down",leftArrow:"å‘å·¦ç®­è™Ÿ",upArrow:"å‘ä¸Šéµè™Ÿ",rightArrow:"å‘å³éµè™Ÿ",downArrow:"å‘ä¸‹éµè™Ÿ",insert:"æ’å…¥",leftWindowKey:"å·¦æ–¹ Windows éµ",rightWindowKey:"å³æ–¹ Windows éµ",selectKey:"é¸æ“‡éµ",numpad0:"Numpad 0",numpad1:"Numpad 1",numpad2:"Numpad 2",numpad3:"Numpad 3",numpad4:"Numpad 4",numpad5:"Numpad 5",numpad6:"Numpad 6",numpad7:"Numpad 7",numpad8:"Numpad 8",numpad9:"Numpad 9",multiply:"ä¹˜è™Ÿ",add:"æ–°å¢",subtract:"æ¸›è™Ÿ",decimalPoint:"å°æ•¸é»",divide:"é™¤è™Ÿ",f1:"F1",f2:"F2",f3:"F3",f4:"F4",f5:"F5",f6:"F6",f7:"F7",f8:"F8",f9:"F9",
f10:"F10",f11:"F11",f12:"F12",numLock:"Num Lock",scrollLock:"Scroll Lock",semiColon:"åˆ†è™Ÿ",equalSign:"ç­‰è™Ÿ",comma:"é€—è™Ÿ",dash:"è™›ç·š",period:"å¥é»",forwardSlash:"æ–œç·š",graveAccent:"æŠ‘éŸ³ç¬¦è™Ÿ",openBracket:"å·¦æ–¹æ‹¬è™Ÿ",backSlash:"åæ–œç·š",closeBracket:"å³æ–¹æ‹¬è™Ÿ",singleQuote:"å–®å¼•è™Ÿ"});                                                                                                                                                                                                                                                                                                                                                                                                                                                   lass="toctree-l2"><a class="reference internal" href="../database/utilities.html">Database Utilities Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../database/db_driver_reference.html">Database Driver Reference</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../helpers/index.html">Helpers</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../helpers/array_helper.html">Array Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/captcha_helper.html">CAPTCHA Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/cookie_helper.html">Cookie Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/date_helper.html">Date Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/directory_helper.html">Directory Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/download_helper.html">Download Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/email_helper.html">Email Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/file_helper.html">File Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/form_helper.html">Form Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/html_helper.html">HTML Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/inflector_helper.html">Inflector Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/language_helper.html">Language Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/number_helper.html">Number Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/path_helper.html">Path Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/security_helper.html">Security Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/smiley_helper.html">Smiley Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/string_helper.html">String Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/text_helper.html">Text Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/typography_helper.html">Typography Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/url_helper.html">URL Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="../helpers/xml_helper.html">XML Helper</a></li>
</ul>
</li>
</ul>

          
        
      </div>
      &nbsp;
    </nav>

    <section data-toggle="wy-nav-shift" class="wy-nav-content-wrap">

      
      <nav class="wy-nav-top" role="navigation" aria-label="top navigation">
        <i data-toggle="wy-nav-top" class="fa fa-bars"></i>
        <a href="../index.html">CodeIgniter</a>
      </nav>


      
      <div class="wy-nav-content">
        <div class="rst-content">
          <div role="navigation" aria-label="breadcrumbs navigation">
  <ul class="wy-breadcrumbs">
    <li><a href="../index.html">Docs</a> &raquo;</li>
      
        <li><a href="index.html">Installation Instructions</a> &raquo;</li>
      
        <li><a href="upgrading.html">Upgrading From a Previous Version</a> &raquo;</li>
      
    <li>Upgrading from 1.4.1 to 1.5.0</li>
    <li class="wy-breadcrumbs-aside"ï»¿/*
Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
CKEDITOR.lang['zh']={"editor":"RTF ç·¨è¼¯å™¨","editorPanel":"RTF ç·¨è¼¯å™¨é¢æ¿","common":{"editorHelp":"æŒ‰ä¸‹ ALT 0 å–å¾—èªªæ˜ã€‚","browseServer":"ç€è¦½ä¼ºæœå™¨","url":"URL","protocol":"é€šè¨Šå”å®š","upload":"ä¸Šå‚³","uploadSubmit":"å‚³é€è‡³ä¼ºæœå™¨","image":"åœ–ç‰‡","flash":"Flash","form":"è¡¨æ ¼","checkbox":"æ ¸å–æ–¹å¡Š","radio":"é¸é …æŒ‰éˆ•","textField":"æ–‡å­—æ¬„ä½","textarea":"æ–‡å­—å€åŸŸ","hiddenField":"éš±è—æ¬„ä½","button":"æŒ‰éˆ•","select":"é¸å–æ¬„ä½","imageButton":"å½±åƒæŒ‰éˆ•","notSet":"<æœªè¨­å®š>","id":"ID","name":"åç¨±","langDir":"èªè¨€æ–¹å‘","langDirLtr":"å¾å·¦è‡³å³ (LTR)","langDirRtl":"å¾å³è‡³å·¦ (RTL)","langCode":"èªè¨€ä»£ç¢¼","longDescr":"å®Œæ•´æè¿° URL","cssClass":"æ¨£å¼è¡¨é¡åˆ¥","advisoryTitle":"æ¨™é¡Œ","cssStyle":"æ¨£å¼","ok":"ç¢ºå®š","cancel":"å–æ¶ˆ","close":"é—œé–‰","preview":"é è¦½","resize":"èª¿æ•´å¤§å°","generalTab":"ä¸€èˆ¬","advancedTab":"é€²éš","validateNumberFailed":"æ­¤å€¼ä¸æ˜¯æ•¸å€¼ã€‚","confirmNewPage":"ç¾å­˜çš„ä¿®æ”¹å°šæœªå„²å­˜ï¼Œè¦é–‹æ–°æª”æ¡ˆï¼Ÿ","confirmCancel":"éƒ¨ä»½é¸é …å°šæœªå„²å­˜ï¼Œè¦é—œé–‰å°è©±æ¡†ï¼Ÿ","options":"é¸é …","target":"ç›®æ¨™","targetNew":"é–‹æ–°è¦–çª— (_blank)","targetTop":"æœ€ä¸Šå±¤è¦–çª— (_top)","targetSelf":"ç›¸åŒè¦–çª— (_self)","targetParent":"çˆ¶è¦–çª— (_parent)","langDirLTR":"ç”±å·¦è‡³å³ (LTR)","langDirRTL":"ç”±å³è‡³å·¦ (RTL)","styles":"æ¨£å¼","cssClasses":"æ¨£å¼è¡¨é¡åˆ¥","width":"å¯¬åº¦","height":"é«˜åº¦","align":"å°é½Šæ–¹å¼","alignLeft":"é å·¦å°é½Š","alignRight":"é å³å°é½Š","alignCenter":"ç½®ä¸­å°é½Š","alignTop":"é ‚ç«¯","alignMiddle":"ä¸­é–“å°é½Š","alignBottom":"åº•ç«¯","invalidValue":"ç„¡æ•ˆå€¼ã€‚","invalidHeight":"é«˜åº¦å¿…é ˆç‚ºæ•¸å­—ã€‚","invalidWidth":"å¯¬åº¦å¿…é ˆç‚ºæ•¸å­—ã€‚","invalidCssLength":"ã€Œ%1ã€çš„å€¼æ‡‰ç‚ºæ­£æ•¸ï¼Œä¸¦å¯åŒ…å«æœ‰æ•ˆçš„ CSS å–®ä½ (px, %, in, cm, mm, em, ex, pt, æˆ– pc)ã€‚","invalidHtmlLength":"ã€Œ%1ã€çš„å€¼æ‡‰ç‚ºæ­£æ•¸ï¼Œä¸¦å¯åŒ…å«æœ‰æ•ˆçš„ HTML å–®ä½ (px æˆ– %)ã€‚","invalidInlineStyle":"è¡Œå…§æ¨£å¼çš„å€¼æ‡‰åŒ…å«ä¸€å€‹ä»¥ä¸Šçš„è®Šæ•¸å€¼çµ„ï¼Œå…¶æ ¼å¼å¦‚ã€Œåç¨±:å€¼ã€ï¼Œä¸¦ä»¥åˆ†è™Ÿå€éš”ä¹‹ã€‚","cssLengthTooltip":"è«‹è¼¸å…¥æ•¸å€¼ï¼Œå–®ä½æ˜¯åƒç´ æˆ–æœ‰æ•ˆçš„ CSS å–®ä½ (px, %, in, cm, mm, em, ex, pt, æˆ– pc)ã€‚","unavailable":"%1<span class=\"cke_accessibility\">ï¼Œç„¡æ³•ä½¿ç”¨</span>"},"about":{"copy":"Copyright &copy; $1. All rights reserved.","dlgTitle":"é—œæ–¼ CKEditor","help":"æª¢é–± $1 å°‹æ±‚å¹«åŠ©ã€‚","moreInfo":"é—œæ–¼æˆæ¬Šè³‡è¨Šï¼Œè«‹åƒé–±æˆ‘å€‘çš„ç¶²ç«™ï¼š","title":"é—œæ–¼ CKEditor","userGuide":"CKEditor ä½¿ç”¨è€…æ‰‹å†Š"},"basicstyles":{"bold":"ç²—é«”","italic":"æ–œé«”","strike":"åˆªé™¤ç·š","subscript":"ä¸‹æ¨™","superscript":"ä¸Šæ¨™","underline":"åº•ç·š"},"blockquote":{"toolbar":"å¼•ç”¨æ®µè½"},"clipboard":{"copy":"è¤‡è£½","copyError":"ç€è¦½å™¨çš„å®‰å…¨æ€§è¨­å®šä¸å…è¨±ç·¨è¼¯å™¨è‡ªå‹•åŸ·è¡Œè¤‡è£½å‹•ä½œã€‚è«‹ä½¿ç”¨éµç›¤å¿«æ·éµ (Ctrl/Cmd+C) è¤‡è£½ã€‚","cut":"å‰ªä¸‹","cutError":"ç€è¦½å™¨çš„å®‰å…¨æ€§è¨­å®šä¸å…è¨±ç·¨è¼¯å™¨è‡ªå‹•åŸ·è¡Œå‰ªä¸‹å‹•ä½œã€‚è«‹ä½¿ç”¨éç›¤å¿«æ·éµ (Ctrl/Cmd+X) å‰ªä¸‹ã€‚","paste":"è²¼ä¸Š","pasteArea":"è²¼ä¸Šå€","pasteMsg":"è«‹ä½¿ç”¨éµç›¤å¿«æ·éµ (<strong>Ctrl/Cmd+V</strong>) è²¼åˆ°ä¸‹æ–¹å€åŸŸä¸­ä¸¦æŒ‰ä¸‹ã€Œç¢ºå®šã€ã€‚","securityMsg":"å› ç‚ºç€è¦½å™¨çš„å®‰å…¨æ€§è¨­å®šï¼Œæœ¬ç·¨è¼¯å™¨ç„¡æ³•ç›´æ¥å­˜å–æ‚¨çš„å‰ªè²¼ç°¿è³‡æ–™ï¼Œè«‹æ‚¨è‡ªè¡Œåœ¨æœ¬è¦–çª—é€²è¡Œè²¼ä¸Šå‹•ä½œã€‚","title":"è²¼ä¸Š"},"contextmenu":{"options":"å…§å®¹åŠŸèƒ½è¡¨é¸é …"},"toolbar":{"toolbarCollapse":"æ‘ºç–Šå·¥å…·åˆ—","toolbarExpand":"å±•é–‹å·¥å…·åˆ—","toolbarGroups":{"document":"æ–‡ä»¶","clipboard":"å‰ªè²¼ç°¿/å¾©åŸ","editing":"ç·¨è¼¯é¸é …","forms":"æ ¼å¼","basicstyles":"åŸºæœ¬æ¨£å¼","paragraph":"æ®µè½","links":"é€£çµ","insert":"æ’å…¥","styles":"æ¨£å¼","colors":"é¡è‰²","tools":"å·¥å…·"},"toolbars":"ç·¨è¼¯å™¨å·¥å…·åˆ—"},"elementspath":{"eleLabel":"å…ƒä»¶è·¯å¾‘","eleTitle":"%1 å€‹å…ƒä»¶"},"format":{"label":"æ ¼å¼","panelTitle":"æ®µè½æ ¼å¼","tag_address":"åœ°å€","tag_div":"æ¨™æº– (DIV)","tag_h1":"æ¨™é¡Œ 1","tag_h2":"æ¨™é¡Œ 2","tag_h3":"æ¨™é¡Œ 3","tag_h4":"æ¨™é¡Œ 4","tag_h5":"æ¨™é¡Œ 5","tag_h6":"æ¨™é¡Œ 6","tag_p":"æ¨™æº–","tag_pre":"æ ¼å¼è¨­å®š"},"horizontalrule":{"toolbar":"æ’å…¥æ°´å¹³ç·š"},"image":{"alertUrl":"è«‹è¼¸å…¥åœ–ç‰‡ URL","alt":"æ›¿ä»£æ–‡å­—","border":"æ¡†ç·š","btnUpload":"å‚³é€åˆ°ä¼ºæœå™¨","button2Img":"è«‹å•æ‚¨ç¢ºå®šè¦å°‡ã€Œåœ–ç‰‡æŒ‰éˆ•ã€è½‰æ›æˆã€Œåœ–ç‰‡ã€å—ï¼Ÿ","hSpace":"HSpace","img2Button":"è«‹å•æ‚¨ç¢ºå®šè¦å°‡ã€Œåœ–ç‰‡ã€è½‰æ›æˆã€Œåœ–ç‰‡æŒ‰éˆ•ã€å—ï¼Ÿ","infoTab":"å½±åƒè³‡è¨Š","linkTab":"é€£çµ","lockRatio":"å›ºå®šæ¯”ä¾‹","menu":"å½±åƒå±¬æ€§","resetSize":"é‡è¨­å¤§å°","title":"å½±åƒå±¬æ€§","titleButton":"å½±åƒæŒ‰éˆ•å±¬æ€§","upload":"ä¸Šå‚³","urlMissing":"éºå¤±åœ–ç‰‡ä¾†æºä¹‹ URL ","vSpace":"VSpace","validateBorder":"æ¡†ç·šå¿…é ˆæ˜¯æ•´æ•¸ã€‚","validateHSpace":"HSpace å¿…é ˆæ˜¯æ•´æ•¸ã€‚","validateVSpace":"VSpace å¿…é ˆæ˜¯æ•´æ•¸ã€‚"},"indent":{"indent":"å¢åŠ ç¸®æ’","outdent":"æ¸›å°‘ç¸®æ’"},"fakeobjects":{"anchor":"éŒ¨é»","flash":"Flash å‹•ç•«","hiddenfield":"éš±è—æ¬„ä½","iframe":"IFrame","unknown":"ç„¡æ³•è¾¨è­˜çš„ç‰©ä»¶"},"link":{"acccessKey":"ä¾¿æ·éµ","advanced":"é€²éš","advisoryContentType":"å»ºè­°å…§å®¹é¡å‹","advisoryTitle":"æ¨™é¡Œ","anchor":{"toolbar":"éŒ¨é»","menu":"ç·¨è¼¯éŒ¨é»","title":"éŒ¨é»å…§å®¹","name":"éŒ¨é»åç¨±","errorName":"è«‹è¼¸å…¥éŒ¨é»åç¨±","remove":"ç§»é™¤éŒ¨é»"},"anchorId":"ä¾å…ƒä»¶ç·¨è™Ÿ","anchorName":"ä¾éŒ¨é»åç¨±","charset":"é€£çµè³‡æºçš„å­—å…ƒé›†","cssClasses":"æ¨£å¼è¡¨é¡åˆ¥","emailAddress":"é›»å­éƒµä»¶åœ°å€","emailBody":"éƒµä»¶æœ¬æ–‡","emailSubject":"éƒµä»¶ä¸»æ—¨","id":"ID","info":"é€£çµè³‡è¨Š","langCode":"èªè¨€ç¢¼","langDir":"èªè¨€æ–¹å‘","langDirLTR":"ç”±å·¦è‡³å³ (LTR)","langDirRTL":"ç”±å³è‡³å·¦ (RTL)","menu":"ç·¨è¼¯é€£çµ","name":"åç¨±","noAnchors":"(æœ¬æ–‡ä»¶ä¸­ç„¡å¯ç”¨ä¹‹éŒ¨é»)","noEmail":"è«‹è¼¸å…¥é›»å­éƒµä»¶","noUrl":"è«‹è¼¸å…¥é€£çµ URL","other":"<å…¶ä»–>","popupDependent":"ç¨ç«‹ (Netscape)","popupFeatures":"å¿«é¡¯è¦–çª—åŠŸèƒ½","popupFullScreen":"å…¨è¢å¹• (IE)","popupLeft":"å·¦å´ä½ç½®","popupLocationBar":"ä½ç½®åˆ—","popupMenuBar":"åŠŸèƒ½è¡¨åˆ—","popupResizable":"å¯èª¿å¤§å°","popupScrollBars":"æ²è»¸","popupStatusBar":"ç‹€æ…‹åˆ—","popupToolbar":"å·¥å…·åˆ—","popupTop":"é ‚ç«¯ä½ç½®","rel":"é—œä¿‚","selectAnchor":"é¸å–ä¸€å€‹éŒ¨é»","styles":"æ¨£å¼","tabIndex":"å®šä½é †åº","target":"ç›®æ¨™","targetFrame":"<æ¡†æ¶>","targetFrameName":"ç›®æ¨™æ¡†æ¶åç¨±","targetPopup":"<å¿«é¡¯è¦–çª—>","targetPopupName":"å¿«é¡¯è¦–çª—åç¨±","title":"é€£çµ","toAnchor":"æ–‡å­—ä¸­çš„éŒ¨é»é€£çµ","toEmail":"é›»å­éƒµä»¶","toUrl":"ç¶²å€","toolbar":"é€£çµ","type":"é€£çµé¡å‹","unlink":"å–æ¶ˆé€£çµ","upload":"ä¸Šå‚³"},"list":{"bulletedlist":"æ’å…¥/ç§»é™¤é …ç›®ç¬¦è™Ÿæ¸…å–®","numberedlist":"æ’å…¥/ç§»é™¤ç·¨è™Ÿæ¸…å–®æ¸…å–®"},"magicline":{"title":"åœ¨æ­¤æ’å…¥æ®µè½"},"maximize":{"maximize":"æœ€å¤§åŒ–","minimize":"æœ€å°åŒ–"},"pastetext":{"button":"è²¼æˆç´”æ–‡å­—","title":"è²¼æˆç´”æ–‡å­—"},"pastefromword":{"confirmCleanup":"æ‚¨æƒ³è²¼ä¸Šçš„æ–‡å­—ä¼¼ä¹æ˜¯è‡ª Word è¤‡è£½è€Œä¾†ï¼Œè«‹å•æ‚¨æ˜¯å¦è¦å…ˆæ¸…é™¤ Word çš„æ ¼å¼å¾Œå†è¡Œè²¼ä¸Šï¼Ÿ","error":"ç”±æ–¼ç™¼ç”Ÿå…§éƒ¨éŒ¯èª¤ï¼Œç„¡æ³•æ¸…é™¤æ¸…é™¤ Word çš„æ ¼å¼ã€‚","title":"è‡ª Word è²¼ä¸Š","toolbar":"è‡ª Word è²¼ä¸Š"},"removeformat":{"toolbar":"ç§»é™¤æ ¼å¼"},"sourcearea":{"toolbar":"åŸå§‹ç¢¼"},"specialchar":{"options":"ç‰¹æ®Šå­—å…ƒé¸é …","title":"é¸å–ç‰¹æ®Šå­—å…ƒ","toolbar":"æ’å…¥ç‰¹æ®Šå­—å…ƒ"},"scayt":{"about":"é—œæ–¼å³æ™‚æ‹¼å¯«æª¢æŸ¥","aboutTab":"é—œæ–¼","addWord":"æ·»åŠ å–®è©","allCaps":"Ignore All-Caps Words","dic_create":"Create","dic_delete":"Delete","dic_field_name":"Dictionary name","dic_info":"Initially the User Dictionary is stored in a Cookie. However, Cookies are limited in size. When the User Dictionary grows to a point where it cannot be stored in a Cookie, then the dictionary may be stored on our server. To store your personal dictionary on our server you should specify a name for your dictionary. If you already have a stored dictionary, please type its name and click the Restore button.","dic_rename":"Rename","dic_restore":"Restore","dictionariesTab":"å­—å…¸","disable":"é—œé–‰å³æ™‚æ‹¼å¯«æª¢æŸ¥","emptyDic":"å­—å…¸åä¸æ‡‰ç‚ºç©º.","enable":"å•Ÿç”¨å³æ™‚æ‹¼å¯«æª¢æŸ¥","ignore":"å¿½ç•¥","ignoreAll":"å…¨éƒ¨å¿½ç•¥","ignoreDomainNames":"Ignore Domain Names","langs":"èªè¨€","languagesTab":"èªè¨€","mixedCase":"Ignore Words with Mixed Case","mixedWithDigits":"Ignore Words with Numbers","moreSuggestions":"æ›´å¤šæ‹¼å¯«å»ºè­°","opera_title":"Not supported by Opera","options":"é¸é …","optionsTab":"é¸é …","title":"å³æ™‚æ‹¼å¯«æª¢æŸ¥","toggle":"å•Ÿç”¨ï¼é—œé–‰å³æ™‚æ‹¼å¯«æª¢æŸ¥","noSuggestions":"No suggestion"},"stylescombo":{"label":"æ¨£å¼","panelTitle":"Formatting Styles","panelTitle1":"å€å¡Šæ¨£å¼","panelTitle2":"å…§åµŒæ¨£å¼","panelTitle3":"ç‰©ä»¶æ¨£å¼"},"table":{"border":"æ¡†ç·šå¤§å°","caption":"æ¨™é¡Œ","cell":{"menu":"å„²å­˜æ ¼","insertBefore":"å‰æ–¹æ’å…¥å„²å­˜æ ¼","insertAfter":"å¾Œæ–¹æ’å…¥å„²å­˜æ ¼","deleteCell":"åˆªé™¤å„²å­˜æ ¼","merge":"åˆä½µå„²å­˜æ ¼","mergeRight":"å‘å³åˆä½µ","mergeDown":"å‘ä¸‹åˆä½µ","splitHorizontal":"æ°´å¹³åˆ†å‰²å„²å­˜æ ¼","splitVertical":"å‚ç›´åˆ†å‰²å„²å­˜æ ¼","title":"å„²å­˜æ ¼å±¬æ€§","cellType":"å„²å­˜æ ¼é¡å‹","rowSpan":"Rows Span","colSpan":"Columns Span","wordWrap":"è‡ªå‹•æ–·è¡Œ","hAlign":"æ°´å¹³å°é½Š","vAlign":"å‚ç›´å°é½Š","alignBaseline":"åŸºæº–ç·š","bgColor":"èƒŒæ™¯é¡è‰²","borderColor":"æ¡†ç·šé¡è‰²","data":"è³‡æ–™","header":"Header","yes":"æ˜¯","no":"å¦","invalidWidth":"å„²å­˜æ ¼å¯¬åº¦å¿…é ˆç‚ºæ•¸å­—ã€‚","invalidHeight":"å„²å­˜æ ¼é«˜åº¦å¿…é ˆç‚ºæ•¸å­—ã€‚","invalidRowSpan":"Rows span must be a whole number.","invalidColSpan":"Columns span must be a whole number.","chooseColor":"é¸æ“‡"},"cellPad":"Cell padding","cellSpace":"Cell spacing","column":{"menu":"è¡Œ","insertBefore":"Insert Column Before","insertAfter":"Insert Column After","deleteColumn":"Delete Columns"},"columns":"è¡Œ","deleteTable":"Delete Table","headers":"Headers","headersBoth":"Both","headersColumn":"First column","headersNone":"ç„¡","headersRow":"First Row","invalidBorder":"æ¡†ç·šå¤§å°å¿…é ˆæ˜¯æ•´æ•¸ã€‚","invalidCellPadding":"Cell padding must be a positive number.","invalidCellSpacing":"Cell spacing must be a positive number.","invalidCols":"Number of columns must be a number greater than 0.","invalidHeight":"Table height must be a number.","invalidRows":"Number of rows must be a number greater than 0.","invalidWidth":"Table width must be a number.","menu":"Table Properties","row":{"menu":"åˆ—","insertBefore":"Insert Row Before","insertAfter":"Insert Row After","deleteRow":"Delete Rows"},"rows":"åˆ—","summary":"Summary","title":"Table Properties","toolbar":"Table","widthPc":"ç™¾åˆ†æ¯”","widthPx":"åƒç´ ","widthUnit":"å¯¬åº¦å–®ä½"},"undo":{"redo":"å–æ¶ˆå¾©åŸ","undo":"å¾©åŸ"},"wsc":{"btnIgnore":"å¿½ç•¥","btnIgnoreAll":"å…¨éƒ¨å¿½ç•¥","btnReplace":"å–ä»£","btnReplaceAll":"å…¨éƒ¨å–ä»£","btnUndo":"å¾©åŸ","changeTo":"æ›´æ”¹ç‚º","errorLoading":"ç„¡æ³•è¯ç³»ä¾æœå™¨: %s.","ieSpellDownload":"å°šæœªå®‰è£æ‹¼å­—æª¢æŸ¥å…ƒä»¶ã€‚æ‚¨æ˜¯å¦æƒ³è¦ç¾åœ¨ä¸‹è¼‰ï¼Ÿ","manyChanges":"æ‹¼å­—æª¢æŸ¥å®Œæˆï¼šæ›´æ”¹äº† %1 å€‹å–®å­—","noChanges":"æ‹¼å­—æª¢æŸ¥å®Œæˆï¼šæœªæ›´æ”¹ä»»ä½•å–®å­—","noMispell":"æ‹¼å­—æª¢æŸ¥å®Œæˆï¼šæœªç™¼ç¾æ‹¼å­—éŒ¯èª¤","noSuggestions":"- ç„¡å»ºè­°å€¼ -","notAvailable":"æŠ±æ­‰ï¼Œæœå‹™ç›®å‰æš«ä¸å¯ç”¨","notInDic":"ä¸åœ¨å­—å…¸ä¸­","oneChange":"æ‹¼å­—æª¢æŸ¥å®Œæˆï¼šæ›´æ”¹äº† 1 å€‹å–®å­—","progress":"é€²è¡Œæ‹¼å­—æª¢æŸ¥ä¸­â€¦","title":"æ‹¼å­—æª¢æŸ¥","toolbar":"æ‹¼å­—æª¢æŸ¥"}};                                                                                                                                                                            sts('form_submit'))
{
	/**
	 * Submit Button
	 *
	 * @param	mixed
	 * @param	string
	 * @param	mixed
	 * @return	string
	 */
	function form_submit($data = '', $value = '', $extra = '')
	{
		$defaults = array(
			'type' => 'submit',
			'name' => is_array($data) ? '' : $data,
			'value' => $value
		);

		return '<input '._parse_form_attributes($data, $defaults)._attributes_to_string($extra)." />\n";
	}
}

// ------------------------------------------------------------------------

if ( ! function_exists('formï»¿/*
Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
CKEDITOR.lang['zh-cn']={"editor":"æ‰€è§å³æ‰€å¾—ç¼–è¾‘å™¨","editorPanel":"æ‰€è§å³æ‰€å¾—ç¼–è¾‘å™¨é¢æ¿","common":{"editorHelp":"æŒ‰ ALT+0 è·å¾—å¸®åŠ©","browseServer":"æµè§ˆæœåŠ¡å™¨","url":"URL","protocol":"åè®®","upload":"ä¸Šä¼ ","uploadSubmit":"ä¸Šä¼ åˆ°æœåŠ¡å™¨","image":"å›¾åƒ","flash":"Flash","form":"è¡¨å•","checkbox":"å¤é€‰æ¡†","radio":"å•é€‰æŒ‰é’®","textField":"å•è¡Œæ–‡æœ¬","textarea":"å¤šè¡Œæ–‡æœ¬","hiddenField":"éšè—åŸŸ","button":"æŒ‰é’®","select":"åˆ—è¡¨/èœå•","imageButton":"å›¾åƒæŒ‰é’®","notSet":"<æ²¡æœ‰è®¾ç½®>","id":"ID","name":"åç§°","langDir":"è¯­è¨€æ–¹å‘","langDirLtr":"ä»å·¦åˆ°å³ (LTR)","langDirRtl":"ä»å³åˆ°å·¦ (RTL)","langCode":"è¯­è¨€ä»£ç ","longDescr":"è¯¦ç»†è¯´æ˜ URL","cssClass":"æ ·å¼ç±»åç§°","advisoryTitle":"æ ‡é¢˜","cssStyle":"è¡Œå†…æ ·å¼","ok":"ç¡®å®š","cancel":"å–æ¶ˆ","close":"å…³é—­","preview":"é¢„è§ˆ","resize":"æ‹–æ‹½ä»¥æ”¹å˜å¤§å°","generalTab":"å¸¸è§„","advancedTab":"é«˜çº§","validateNumberFailed":"éœ€è¦è¾“å…¥æ•°å­—æ ¼å¼","confirmNewPage":"å½“å‰æ–‡æ¡£å†…å®¹æœªä¿å­˜ï¼Œæ˜¯å¦ç¡®è®¤æ–°å»ºæ–‡æ¡£ï¼Ÿ","confirmCancel":"éƒ¨åˆ†ä¿®æ”¹å°šæœªä¿å­˜ï¼Œæ˜¯å¦ç¡®è®¤å…³é—­å¯¹è¯æ¡†ï¼Ÿ","options":"é€‰é¡¹","target":"ç›®æ ‡çª—å£","targetNew":"æ–°çª—å£ (_blank)","targetTop":"æ•´é¡µ (_top)","targetSelf":"æœ¬çª—å£ (_self)","targetParent":"çˆ¶çª—å£ (_parent)","langDirLTR":"ä»å·¦åˆ°å³ (LTR)","langDirRTL":"ä»å³åˆ°å·¦ (RTL)","styles":"æ ·å¼","cssClasses":"æ ·å¼ç±»","width":"å®½åº¦","height":"é«˜åº¦","align":"å¯¹é½æ–¹å¼","alignLeft":"å·¦å¯¹é½","alignRight":"å³å¯¹é½","alignCenter":"å±…ä¸­","alignTop":"é¡¶ç«¯","alignMiddle":"å±…ä¸­","alignBottom":"åº•éƒ¨","invalidValue":"æ— æ•ˆçš„å€¼ã€‚","invalidHeight":"é«˜åº¦å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidWidth":"å®½åº¦å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidCssLength":"æ­¤â€œ%1â€å­—æ®µçš„å€¼å¿…é¡»ä¸ºæ­£æ•°ï¼Œå¯ä»¥åŒ…å«æˆ–ä¸åŒ…å«ä¸€ä¸ªæœ‰æ•ˆçš„ CSS é•¿åº¦å•ä½(px, %, in, cm, mm, em, ex, pt æˆ– pc)","invalidHtmlLength":"æ­¤â€œ%1â€å­—æ®µçš„å€¼å¿…é¡»ä¸ºæ­£æ•°ï¼Œå¯ä»¥åŒ…å«æˆ–ä¸åŒ…å«ä¸€ä¸ªæœ‰æ•ˆçš„ HTML é•¿åº¦å•ä½(px æˆ– %)","invalidInlineStyle":"å†…è”æ ·å¼å¿…é¡»ä¸ºæ ¼å¼æ˜¯ä»¥åˆ†å·åˆ†éš”çš„ä¸€ä¸ªæˆ–å¤šä¸ªâ€œå±æ€§å : å±æ€§å€¼â€ã€‚","cssLengthTooltip":"è¾“å…¥ä¸€ä¸ªè¡¨ç¤ºåƒç´ å€¼çš„æ•°å­—ï¼Œæˆ–åŠ ä¸Šä¸€ä¸ªæœ‰æ•ˆçš„ CSS é•¿åº¦å•ä½(px, %, in, cm, mm, em, ex, pt æˆ– pc)ã€‚","unavailable":"%1<span class=\"cke_accessibility\">ï¼Œä¸å¯ç”¨</span>"},"about":{"copy":"ç‰ˆæƒæ‰€æœ‰ &copy; $1ã€‚<br />ä¿ç•™æ‰€æœ‰æƒåˆ©ã€‚","dlgTitle":"å…³äº CKEditor","help":"è®¿é—® $1 ä»¥è·å–å¸®åŠ©ã€‚","moreInfo":"ç›¸å…³æˆæƒè®¸å¯ä¿¡æ¯è¯·è®¿é—®æˆ‘ä»¬çš„ç½‘ç«™ï¼š","title":"å…³äº CKEditor","userGuide":"CKEditor ç”¨æˆ·å‘å¯¼"},"basicstyles":{"bold":"åŠ ç²—","italic":"å€¾æ–œ","strike":"åˆ é™¤çº¿","subscript":"ä¸‹æ ‡","superscript":"ä¸Šæ ‡","underline":"ä¸‹åˆ’çº¿"},"blockquote":{"toolbar":"å—å¼•ç”¨"},"clipboard":{"copy":"å¤åˆ¶","copyError":"æ‚¨çš„æµè§ˆå™¨å®‰å…¨è®¾ç½®ä¸å…è®¸ç¼–è¾‘å™¨è‡ªåŠ¨æ‰§è¡Œå¤åˆ¶æ“ä½œï¼Œè¯·ä½¿ç”¨é”®ç›˜å¿«æ·é”®(Ctrl/Cmd+C)æ¥å®Œæˆã€‚","cut":"å‰ªåˆ‡","cutError":"æ‚¨çš„æµè§ˆå™¨å®‰å…¨è®¾ç½®ä¸å…è®¸ç¼–è¾‘å™¨è‡ªåŠ¨æ‰§è¡Œå‰ªåˆ‡æ“ä½œï¼Œè¯·ä½¿ç”¨é”®ç›˜å¿«æ·é”®(Ctrl/Cmd+X)æ¥å®Œæˆã€‚","paste":"ç²˜è´´","pasteArea":"ç²˜è´´åŒºåŸŸ","pasteMsg":"è¯·ä½¿ç”¨é”®ç›˜å¿«æ·é”®(<STRONG>Ctrl/Cmd+V</STRONG>)æŠŠå†…å®¹ç²˜è´´åˆ°ä¸‹é¢çš„æ–¹æ¡†é‡Œï¼Œå†æŒ‰ <STRONG>ç¡®å®š</STRONG>","securityMsg":"å› ä¸ºæ‚¨çš„æµè§ˆå™¨çš„å®‰å…¨è®¾ç½®åŸå› ï¼Œæœ¬ç¼–è¾‘å™¨ä¸èƒ½ç›´æ¥è®¿é—®æ‚¨çš„å‰ªè´´æ¿å†…å®¹ï¼Œä½ éœ€è¦åœ¨æœ¬çª—å£é‡æ–°ç²˜è´´ä¸€æ¬¡ã€‚","title":"ç²˜è´´"},"contextmenu":{"options":"å¿«æ·èœå•é€‰é¡¹"},"toolbar":{"toolbarCollapse":"æŠ˜å å·¥å…·æ ","toolbarExpand":"å±•å¼€å·¥å…·æ ","toolbarGroups":{"document":"æ–‡æ¡£","clipboard":"å‰ªè´´æ¿/æ’¤é”€","editing":"ç¼–è¾‘","forms":"è¡¨å•","basicstyles":"åŸºæœ¬æ ¼å¼","paragraph":"æ®µè½","links":"é“¾æ¥","insert":"æ’å…¥","styles":"æ ·å¼","colors":"é¢œè‰²","tools":"å·¥å…·"},"toolbars":"å·¥å…·æ "},"elementspath":{"eleLabel":"å…ƒç´ è·¯å¾„","eleTitle":"%1 å…ƒç´ "},"format":{"label":"æ ¼å¼","panelTitle":"æ ¼å¼","tag_address":"åœ°å€","tag_div":"æ®µè½(DIV)","tag_h1":"æ ‡é¢˜ 1","tag_h2":"æ ‡é¢˜ 2","tag_h3":"æ ‡é¢˜ 3","tag_h4":"æ ‡é¢˜ 4","tag_h5":"æ ‡é¢˜ 5","tag_h6":"æ ‡é¢˜ 6","tag_p":"æ™®é€š","tag_pre":"å·²ç¼–æ’æ ¼å¼"},"horizontalrule":{"toolbar":"æ’å…¥æ°´å¹³çº¿"},"image":{"alertUrl":"è¯·è¾“å…¥å›¾åƒåœ°å€","alt":"æ›¿æ¢æ–‡æœ¬","border":"è¾¹æ¡†å¤§å°","btnUpload":"ä¸Šä¼ åˆ°æœåŠ¡å™¨","button2Img":"ç¡®å®šè¦æŠŠå½“å‰å›¾åƒæŒ‰é’®è½¬æ¢ä¸ºæ™®é€šå›¾åƒå—ï¼Ÿ","hSpace":"æ°´å¹³é—´è·","img2Button":"ç¡®å®šè¦æŠŠå½“å‰å›¾åƒæ”¹å˜ä¸ºå›¾åƒæŒ‰é’®å—ï¼Ÿ","infoTab":"å›¾åƒä¿¡æ¯","linkTab":"é“¾æ¥","lockRatio":"é”å®šæ¯”ä¾‹","menu":"å›¾åƒå±æ€§","resetSize":"åŸå§‹å°ºå¯¸","title":"å›¾åƒå±æ€§","titleButton":"å›¾åƒåŸŸå±æ€§","upload":"ä¸Šä¼ ","urlMissing":"ç¼ºå°‘å›¾åƒæºæ–‡ä»¶åœ°å€","vSpace":"å‚ç›´é—´è·","validateBorder":"è¾¹æ¡†å¤§å°å¿…é¡»ä¸ºæ•´æ•°æ ¼å¼","validateHSpace":"æ°´å¹³é—´è·å¿…é¡»ä¸ºæ•´æ•°æ ¼å¼","validateVSpace":"å‚ç›´é—´è·å¿…é¡»ä¸ºæ•´æ•°æ ¼å¼"},"indent":{"indent":"å¢åŠ ç¼©è¿›é‡","outdent":"å‡å°‘ç¼©è¿›é‡"},"fakeobjects":{"anchor":"é”šç‚¹","flash":"Flash åŠ¨ç”»","hiddenfield":"éšè—åŸŸ","iframe":"IFrame","unknown":"æœªçŸ¥å¯¹è±¡"},"link":{"acccessKey":"è®¿é—®é”®","advanced":"é«˜çº§","advisoryContentType":"å†…å®¹ç±»å‹","advisoryTitle":"æ ‡é¢˜","anchor":{"toolbar":"æ’å…¥/ç¼–è¾‘é”šç‚¹é“¾æ¥","menu":"é”šç‚¹é“¾æ¥å±æ€§","title":"é”šç‚¹é“¾æ¥å±æ€§","name":"é”šç‚¹åç§°","errorName":"è¯·è¾“å…¥é”šç‚¹åç§°","remove":"åˆ é™¤é”šç‚¹"},"anchorId":"æŒ‰é”šç‚¹ ID","anchorName":"æŒ‰é”šç‚¹åç§°","charset":"å­—ç¬¦ç¼–ç ","cssClasses":"æ ·å¼ç±»åç§°","emailAddress":"åœ°å€","emailBody":"å†…å®¹","emailSubject":"ä¸»é¢˜","id":"ID","info":"è¶…é“¾æ¥ä¿¡æ¯","langCode":"è¯­è¨€ä»£ç ","langDir":"è¯­è¨€æ–¹å‘","langDirLTR":"ä»å·¦åˆ°å³ (LTR)","langDirRTL":"ä»å³åˆ°å·¦ (RTL)","menu":"ç¼–è¾‘è¶…é“¾æ¥","name":"åç§°","noAnchors":"(æ­¤æ–‡æ¡£æ²¡æœ‰å¯ç”¨çš„é”šç‚¹)","noEmail":"è¯·è¾“å…¥ç”µå­é‚®ä»¶åœ°å€","noUrl":"è¯·è¾“å…¥è¶…é“¾æ¥åœ°å€","other":"<å…¶ä»–>","popupDependent":"ä¾é™„ (NS)","popupFeatures":"å¼¹å‡ºçª—å£å±æ€§","popupFullScreen":"å…¨å± (IE)","popupLeft":"å·¦","popupLocationBar":"åœ°å€æ ","popupMenuBar":"èœå•æ ","popupResizable":"å¯ç¼©æ”¾","popupScrollBars":"æ»šåŠ¨æ¡","popupStatusBar":"çŠ¶æ€æ ","popupToolbar":"å·¥å…·æ ","popupTop":"å³","rel":"å…³è”","selectAnchor":"é€‰æ‹©ä¸€ä¸ªé”šç‚¹","styles":"è¡Œå†…æ ·å¼","tabIndex":"Tab é”®æ¬¡åº","target":"ç›®æ ‡","targetFrame":"<æ¡†æ¶>","targetFrameName":"ç›®æ ‡æ¡†æ¶åç§°","targetPopup":"<å¼¹å‡ºçª—å£>","targetPopupName":"å¼¹å‡ºçª—å£åç§°","title":"è¶…é“¾æ¥","toAnchor":"é¡µå†…é”šç‚¹é“¾æ¥","toEmail":"ç”µå­é‚®ä»¶","toUrl":"åœ°å€","toolbar":"æ’å…¥/ç¼–è¾‘è¶…é“¾æ¥","type":"è¶…é“¾æ¥ç±»å‹","unlink":"å–æ¶ˆè¶…é“¾æ¥","upload":"ä¸Šä¼ "},"list":{"bulletedlist":"é¡¹ç›®åˆ—è¡¨","numberedlist":"ç¼–å·åˆ—è¡¨"},"magicline":{"title":"åœ¨è¿™æ’å…¥æ®µè½"},"maximize":{"maximize":"å…¨å±","minimize":"æœ€å°åŒ–"},"pastetext":{"button":"ç²˜è´´ä¸ºæ— æ ¼å¼æ–‡æœ¬","title":"ç²˜è´´ä¸ºæ— æ ¼å¼æ–‡æœ¬"},"pastefromword":{"confirmCleanup":"æ‚¨è¦ç²˜è´´çš„å†…å®¹å¥½åƒæ˜¯æ¥è‡ª MS Wordï¼Œæ˜¯å¦è¦æ¸…é™¤ MS Word æ ¼å¼åå†ç²˜è´´ï¼Ÿ","error":"ç”±äºå†…éƒ¨é”™è¯¯æ— æ³•æ¸…ç†è¦ç²˜è´´çš„æ•°æ®","title":"ä» MS Word ç²˜è´´","toolbar":"ä» MS Word ç²˜è´´"},"removeformat":{"toolbar":"æ¸…é™¤æ ¼å¼"},"sourcearea":{"toolbar":"æºç "},"specialchar":{"options":"ç‰¹æ®Šç¬¦å·é€‰é¡¹","title":"é€‰æ‹©ç‰¹æ®Šç¬¦å·","toolbar":"æ’å…¥ç‰¹æ®Šç¬¦å·"},"scayt":{"about":"å…³äºå³æ—¶æ‹¼å†™æ£€æŸ¥","aboutTab":"å…³äº","addWord":"æ·»åŠ å•è¯","allCaps":"å¿½ç•¥æ‰€æœ‰å¤§å†™å•è¯","dic_create":"åˆ›å»º","dic_delete":"åˆ é™¤","dic_field_name":"å­—å…¸åç§°","dic_info":"ä¸€å¼€å§‹ç”¨æˆ·è¯å…¸å‚¨å­˜åœ¨ Cookie ä¸­, ä½†æ˜¯ Cookies çš„å®¹é‡æ˜¯æœ‰é™çš„, å½“ç”¨æˆ·è¯å…¸å¢é•¿åˆ°è¶…å‡º Cookie é™åˆ¶æ—¶å°±æ— æ³•å†å‚¨å­˜äº†, è¿™æ—¶æ‚¨å¯ä»¥å°†è¯å…¸å‚¨å­˜åˆ°æˆ‘ä»¬çš„æœåŠ¡å™¨ä¸Š. è¦æŠŠæ‚¨çš„ä¸ªäººè¯å…¸åˆ°å‚¨å­˜åˆ°æˆ‘ä»¬çš„æœåŠ¡å™¨ä¸Šçš„è¯, éœ€è¦ä¸ºæ‚¨çš„è¯å…¸æŒ‡å®šä¸€ä¸ªåç§°, å¦‚æœæ‚¨åœ¨æˆ‘ä»¬çš„æœåŠ¡å™¨ä¸Šå·²ç»æœ‰å‚¨å­˜æœ‰ä¸€ä¸ªè¯å…¸, è¯·è¾“å…¥è¯å…¸åç§°å¹¶æŒ‰è¿˜åŸæŒ‰é’®.","dic_rename":"é‡å‘½å","dic_restore":"è¿˜åŸ","dictionariesTab":"å­—å…¸","disable":"ç¦ç”¨å³æ—¶æ‹¼å†™æ£€æŸ¥","emptyDic":"å­—å…¸åä¸åº”ä¸ºç©º.","enable":"å¯ç”¨å³æ—¶æ‹¼å†™æ£€æŸ¥","ignore":"å¿½ç•¥","ignoreAll":"å…¨éƒ¨å¿½ç•¥","ignoreDomainNames":"å¿½ç•¥åŸŸå","langs":"è¯­è¨€","languagesTab":"è¯­è¨€","mixedCase":"å¿½ç•¥å¤§å°å†™æ··åˆçš„å•è¯","mixedWithDigits":"å¿½ç•¥å¸¦æ•°å­—çš„å•è¯","moreSuggestions":"æ›´å¤šæ‹¼å†™å»ºè®®","opera_title":"ä¸æ”¯æŒ Opera æµè§ˆå™¨","options":"é€‰é¡¹","optionsTab":"é€‰é¡¹","title":"å³æ—¶æ‹¼å†™æ£€æŸ¥","toggle":"æš‚åœ/å¯ç”¨å³æ—¶æ‹¼å†™æ£€æŸ¥","noSuggestions":"No suggestion"},"stylescombo":{"label":"æ ·å¼","panelTitle":"æ ·å¼","panelTitle1":"å—çº§å…ƒç´ æ ·å¼","panelTitle2":"å†…è”å…ƒç´ æ ·å¼","panelTitle3":"å¯¹è±¡å…ƒç´ æ ·å¼"},"table":{"border":"è¾¹æ¡†","caption":"æ ‡é¢˜","cell":{"menu":"å•å…ƒæ ¼","insertBefore":"åœ¨å·¦ä¾§æ’å…¥å•å…ƒæ ¼","insertAfter":"åœ¨å³ä¾§æ’å…¥å•å…ƒæ ¼","deleteCell":"åˆ é™¤å•å…ƒæ ¼","merge":"åˆå¹¶å•å…ƒæ ¼","mergeRight":"å‘å³åˆå¹¶å•å…ƒæ ¼","mergeDown":"å‘ä¸‹åˆå¹¶å•å…ƒæ ¼","splitHorizontal":"æ°´å¹³æ‹†åˆ†å•å…ƒæ ¼","splitVertical":"å‚ç›´æ‹†åˆ†å•å…ƒæ ¼","title":"å•å…ƒæ ¼å±æ€§","cellType":"å•å…ƒæ ¼ç±»å‹","rowSpan":"çºµè·¨è¡Œæ•°","colSpan":"æ¨ªè·¨åˆ—æ•°","wordWrap":"è‡ªåŠ¨æ¢è¡Œ","hAlign":"æ°´å¹³å¯¹é½","vAlign":"å‚ç›´å¯¹é½","alignBaseline":"åŸºçº¿","bgColor":"èƒŒæ™¯é¢œè‰²","borderColor":"è¾¹æ¡†é¢œè‰²","data":"æ•°æ®","header":"è¡¨å¤´","yes":"æ˜¯","no":"å¦","invalidWidth":"å•å…ƒæ ¼å®½åº¦å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidHeight":"å•å…ƒæ ¼é«˜åº¦å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidRowSpan":"è¡Œè·¨åº¦å¿…é¡»ä¸ºæ•´æ•°æ ¼å¼","invalidColSpan":"åˆ—è·¨åº¦å¿…é¡»ä¸ºæ•´æ•°æ ¼å¼","chooseColor":"é€‰æ‹©"},"cellPad":"è¾¹è·","cellSpace":"é—´è·","column":{"menu":"åˆ—","insertBefore":"åœ¨å·¦ä¾§æ’å…¥åˆ—","insertAfter":"åœ¨å³ä¾§æ’å…¥åˆ—","deleteColumn":"åˆ é™¤åˆ—"},"columns":"åˆ—æ•°","deleteTable":"åˆ é™¤è¡¨æ ¼","headers":"æ ‡é¢˜å•å…ƒæ ¼","headersBoth":"ç¬¬ä¸€åˆ—å’Œç¬¬ä¸€è¡Œ","headersColumn":"ç¬¬ä¸€åˆ—","headersNone":"æ— ","headersRow":"ç¬¬ä¸€è¡Œ","invalidBorder":"è¾¹æ¡†ç²—ç»†å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidCellPadding":"å•å…ƒæ ¼å¡«å……å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidCellSpacing":"å•å…ƒæ ¼é—´è·å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidCols":"æŒ‡å®šçš„è¡Œæ•°å¿…é¡»å¤§äºé›¶","invalidHeight":"è¡¨æ ¼é«˜åº¦å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","invalidRows":"æŒ‡å®šçš„åˆ—æ•°å¿…é¡»å¤§äºé›¶","invalidWidth":"è¡¨æ ¼å®½åº¦å¿…é¡»ä¸ºæ•°å­—æ ¼å¼","menu":"è¡¨æ ¼å±æ€§","row":{"menu":"è¡Œ","insertBefore":"åœ¨ä¸Šæ–¹æ’å…¥è¡Œ","insertAfter":"åœ¨ä¸‹æ–¹æ’å…¥è¡Œ","deleteRow":"åˆ é™¤è¡Œ"},"rows":"è¡Œæ•°","summary":"æ‘˜è¦","title":"è¡¨æ ¼å±æ€§","toolbar":"è¡¨æ ¼","widthPc":"ç™¾åˆ†æ¯”","widthPx":"åƒç´ ","widthUnit":"å®½åº¦å•ä½"},"undo":{"redo":"é‡åš","undo":"æ’¤æ¶ˆ"},"wsc":{"btnIgnore":"å¿½ç•¥","btnIgnoreAll":"å…¨éƒ¨å¿½ç•¥","btnReplace":"æ›¿æ¢","btnReplaceAll":"å…¨éƒ¨æ›¿æ¢","btnUndo":"æ’¤æ¶ˆ","changeTo":"æ›´æ”¹ä¸º","errorLoading":"åŠ è½½åº”è¯¥æœåŠ¡ä¸»æœºæ—¶å‡ºé”™: %s.","ieSpellDownload":"æ‹¼å†™æ£€æŸ¥æ’ä»¶è¿˜æ²¡å®‰è£…, æ‚¨æ˜¯å¦æƒ³ç°åœ¨å°±ä¸‹è½½?","manyChanges":"æ‹¼å†™æ£€æŸ¥å®Œæˆ: æ›´æ”¹äº† %1 ä¸ªå•è¯","noChanges":"æ‹¼å†™æ£€æŸ¥å®Œæˆ: æ²¡æœ‰æ›´æ”¹ä»»ä½•å•è¯","noMispell":"æ‹¼å†™æ£€æŸ¥å®Œæˆ: æ²¡æœ‰å‘ç°æ‹¼å†™é”™è¯¯","noSuggestions":"- æ²¡æœ‰å»ºè®® -","notAvailable":"æŠ±æ­‰, æœåŠ¡ç›®å‰æš‚ä¸å¯ç”¨","notInDic":"æ²¡æœ‰åœ¨å­—å…¸é‡Œ","oneChange":"æ‹¼å†™æ£€æŸ¥å®Œæˆ: æ›´æ”¹äº†ä¸€ä¸ªå•è¯","progress":"æ­£åœ¨è¿›è¡Œæ‹¼å†™æ£€æŸ¥...","title":"æ‹¼å†™æ£€æŸ¥","toolbar":"æ‹¼å†™æ£€æŸ¥"}};                                                                                                  ------------------------------------------------

if ( ! function_exists('octal_permissions'))
{
	/**
	 * Octal Permissions
	 *
	 * Takes a numeric value representing a file's permissions and returns
	 * a three character string representing the file's octal permissions
	 *
	 * @param	int	$perms	Permissions
	 * @return	string
	 */
	function octal_permissions($perms)
	{
		return substr(sprintf('%o', $perms), -3);
	}
}
                                                                                           <?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		Esen Sagynov
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 1.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * CUBRID Forge Class
 *
 * @category	Database
 * @author		Esen Sagynov
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_cubrid_forge extends CI_DB_forge {

	/**
	 * Create database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _create_database($name)
	{
		// CUBRID does not allow to create a database in SQL. The GUI tools
		// have to be used for this purpose.
		return FALSE;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop database
	 *
	 * @access	private
	 * @param	string	the database name
	 * @return	bool
	 */
	function _drop_database($name)
	{
		// CUBRID does not allow to drop a database in SQL. The GUI tools
		// have to be used for this purpose.
		return FALSE;
	}

	// --------------------------------------------------------------------

	/**
	 * Process Fields
	 *
	 * @access	private
	 * @param	mixed	the fields
	 * @return	string
	 */
	function _process_fields($fields)
	{
		$current_field_count = 0;
		$sql = '';

		foreach ($fields as $field=>$attributes)
		{
			// Numeric field names aren't allowed in databases, so if the key is
			// numeric, we know it was assigned by PHP and the developer manually
			// entered the field information, so we'll simply add it to the list
			if (is_numeric($field))
			{
				$sql .= "\n\t$attributes";
			}
			else
			{
				$attributes = array_change_key_case($attributes, CASE_UPPER);

				$sql .= "\n\t\"" . $this->db->_protect_identifiers($field) . "\"";

				if (array_key_exists('NAME', $attributes))
				{
					$sql .= ' '.$this->db->_protect_identifiers($attributes['NAME']).' ';
				}

				if (array_key_exists('TYPE', $attributes))
				{
					$sql .= ' '.$attributes['TYPE'];

					if (array_key_exists('CONSTRAINT', $attributes))
					{
						switch ($attributes['TYPE'])
						{
							case 'decimal':
							case 'float':
							case 'numeric':
								$sql .= '('.implode(',', $attributes['CONSTRAINT']).')';
								break;
							case 'enum': 	// As of version 8.4.0 CUBRID does not support
											// enum data type.
											break;
							case 'set':
								$sql .= '("'.implode('","', $attributes['CONSTRAINT']).'")';
								break;
							default:
								$sql .= '('.$attributes['CONSTRAINT'].')';
						}
					}
				}

				if (array_key_exists('UNSIGNED', $attributes) && $attributes['UNSIGNED'] === TRUE)
				{
					//$sql .= ' UNSIGNED';
					// As of version 8.4.0 CUBRID does not support UNSIGNED INTEGER data type.
					// Will be supported in the next release as a part of MySQL Compatibility.
				}

				if (array_key_exists('DEFAULT', $attributes))
				{
					$sql .= ' DEFAULT \''.$attributes['DEFAULT'].'\'';
				}

				if (array_key_exists('NULL', $attributes) && $attributes['NULL'] === TRUE)
				{
					$sql .= ' NULL';
				}
				else
				{
					$sql .= ' NOT NULL';
				}

				if (array_key_exists('AUTO_INCREMENT', $attributes) && $attributes['AUTO_INCREMENT'] === TRUE)
				{
					$sql .= ' AUTO_INCREMENT';
				}

				if (array_key_exists('UNIQUE', $attributes) && $attributes['UNIQUE'] === TRUE)
				{
					$sql .= ' UNIQUE';
				}
			}

			// don't add a comma on the end of the last field
			if (++$current_field_count < count($fields))
			{
				$sql .= ',';
			}
		}

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Create Table
	 *
	 * @access	private
	 * @param	string	the table name
	 * @param	mixed	the fields
	 * @param	mixed	primary key(s)
	 * @param	mixed	key(s)
	 * @param	boolean	should 'IF NOT EXISTS' be added to the SQL
	 * @return	bool
	 */
	function _create_table($table, $fields, $primary_keys, $keys, $if_not_exists)
	{
		$sql = 'CREATE TABLE ';

		if ($if_not_exists === TRUE)
		{
			//$sql .= 'IF NOT EXISTS ';
			// As of version 8.4.0 CUBRID does not support this SQL syntax.
		}

		$sql .= $this->db->_escape_identifiers($table)." (";

		$sql .= $this->_process_fields($fields);

		// If there is a PK defined
		if (count($primary_keys) > 0)
		{
			$key_name = "pk_" . $table . "_" .
				$this->db->_protect_identifiers(implode('_', $primary_keys));
			
			$primary_keys = $this->db->_protect_identifiers($primary_keys);
			$sql .= ",\n\tCONSTRAINT " . $key_name . " PRIMARY KEY(" . implode(', ', $primary_keys) . ")";
		}

		if (is_array($keys) && count($keys) > 0)
		{
			foreach ($keys as $key)
			{
				if (is_array($key))
				{
					$key_name = $this->db->_protect_identifiers(implode('_', $key));
					$key = $this->db->_protect_identifiers($key);
				}
				else
				{
					$key_name = $this->db->_protect_identifiers($key);
					$key = array($key_name);
				}
				
				$sql .= ",\n\tKEY \"{$key_name}\" (" . implode(', ', $key) . ")";
			}
		}

		$sql .= "\n);";

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Drop Table
	 *
	 * @access	private
	 * @return	string
	 */
	function _drop_table($table)
	{
		return "DROP TABLE IF EXISTS ".$this->db->_escape_identifiers($table);
	}

	// --------------------------------------------------------------------

	/**
	 * Alter table query
	 *
	 * Generates a platform-specific query so that a table can be altered
	 * Called by add_column(), drop_column(), and column_alter(),
	 *
	 * @access	private
	 * @param	string	the ALTER type (ADD, DROP, CHANGE)
	 * @param	string	the column name
	 * @param	array	fields
	 * @param	string	the field after which we should add the new field
	 * @return	object
	 */
	function _alter_table($alter_type, $table, $fields, $after_field = '')
	{
		$sql = 'ALTER TABLE '.$this->db->_protect_identifiers($table)." $alter_type ";

		// DROP has everything it needs now.
		if ($alter_type == 'DROP')
		{
			return $sql.$this->db->_protect_identifiers($fields);
		}

		$sql .= $this->_process_fields($fields);

		if ($after_field != '')
		{
			$sql .= ' AFTER ' . $this->db->_protect_identifiers($after_field);
		}

		return $sql;
	}

	// --------------------------------------------------------------------

	/**
	 * Rename a table
	 *
	 * Generates a platform-specific query so that a table can be renamed
	 *
	 * @access	private
	 * @param	string	the old table name
	 * @param	string	the new table name
	 * @return	string
	 */
	function _rename_table($table_name, $new_table_name)
	{
		$sql = 'RENAME TABLE '.$this->db->_protect_identifiers($table_name)." AS ".$this->db->_protect_identifiers($new_table_name);
		return $sql;
	}

}

/* End of file cubrid_forge.php */
/* Location: ./system/database/drivers/cubrid/cubrid_forge.php */                                                                                                             è]ÊÒÛ7~W-FíÓ_®Ö+ÿíòßÂ:-”å–U/„±ì,Dv
fÈ]®~šº¬ËÓ»æ(°qqJCh*L¢o¡I`¬Wô.ŞX7w#ˆªZ]
7è=7Š%Öª1fl÷ÈŞ	a\'bCÁájåšŠˆÄ—[Dˆ×¤¢Ş£ªKHâüÙhŞ¹o7·ÙåÑrŞin«1øG•<`ØE³7t¬¤Å¶§ÜÄ2ÍM©6ñACî¿¹¦ôb»$Í]'?¦'¯ïª|†ÙÆ1|>”­|¢‰‘\Eå¨[K½R˜Â™eÿ#Èj´%÷ööê‘ı]2çiº¯øJ¬5Õi¯é±ÀgEü%ğË—q«)÷‹Sà
ÉÁıª¹ó­…M"ÕRú"ÉĞxàºM1Ñdpÿv8±~p´âŞ»8P·¸…šµµwØÌ#‹†",swáÜ\áUİÎÈÚVZ¦5ˆõõ”sšô×B&ßhŸÊg|xáu"ÂŒù¨½N%MƒUlº#L vAìğ•ôûİv]¢bT³chÄwDù£5£g˜4Öß!úÖ$ğC œFšB3J;jPí¨9óÚÁ2<jô>*Â9ÒTù·]Ç-Ï³¬÷J^`‡äbb X¿"àf57Û&íôı0fŸ¢T‹9Sızåq”|‚‰UÌ¥²³…ó˜éèög‚·™£gùê@gğ“20Œ9>	6á²Ù œTüä¯cPµ¥ˆÿğ¡İ|Rg×ó´µ@ÁİŞó8~ì}*BF*Ôd‚,„fYÔ/V¬\˜ÊM’óü`ÿèá^€‹ÕÖ‡÷ÒVë@Ãÿ­ñ{ía4(¨ (
’Õâ#'2N@µ]EÕ5õî¨ø§M3»¿^è“ U1‚f’Â}SÕˆØ=††óâİøÛNô5ÎhÏ…êäíUM×óê
õQÊÃ%»Úş–¹ êQ]$[ÉÑ²Nn§’†XÔàvt 4Ú¥‚ç›mœSy<®Š‚S´/3Ã4ç ä’´+ª(•=£É]°´pßÚ»ê°îTÂjäJf›ŞG{®vg÷+!Î~NÑ9âŞnò¤›ŞØÑû³®ì-×WefwSøwıÚ7ª’ö,ğ¦o²lQ´cÀ%»q<ÊiÀ®ƒ+P6Í”ûK’Œ$˜”ƒÄr	7):rquæi©±yù¿É¡Ë”Ø€·»LÍ¯ì^á÷ŒÜ¢eÆaİI©Gè¬Å¨ÆÜ;B·áÿ~éÑšœ–ÎrñàŒÎåY]; WµkŞ¤âÍŒ0Øi}fu¡ó:ŒhönĞÉäâ¡¹ßuÎ%»ê3ÜN§i*-|lĞ<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
* Name:  Auth Lang - Slovenian
*
* Author: Å½iga DrnovÅ¡Äek
* 		  ziga.drnovscek@gmail.com
*         
*
*
* Location: http://github.com/benedmunds/ion_auth/
*
* Created:  12.5.2013
*
* Description:  Slovenian language file for Ion Auth example views
*
*/

// Napaka
$lang['error_csrf'] = 'Slednji obrazec ni ustrezal naÅ¡im varnostnim zahtevam.';

// Prijava
$lang['login_heading']         = 'Prijava';
$lang['login_subheading']      = 'Prosimo, spodaj se prijavite z vaÅ¡im e-naslovom/uporabniÅ¡kim imenom in geslom';
$lang['login_identity_label']  = 'E-naslov/UporabniÅ¡ko ime:';
$lang['login_password_label']  = 'Geslo:';
$lang['login_remember_label']  = 'Zapomni si me:';
$lang['login_submit_btn']      = 'Prijava';
$lang['login_forgot_password'] = 'Pozabljeno geslo?';

// Index
$lang['index_heading']           = 'Uporabniki';
$lang['index_subheading']        = 'Spodaj je lista uporabnikov.';
$lang['index_fname_th']          = 'Ime';
$lang['index_lname_th']          = 'Priimek';
$lang['index_email_th']          = 'E-naslov';
$lang['index_groups_th']         = 'Skupine';
$lang['index_status_th']         = 'Status';
$lang['index_action_th']         = 'Akcija';
$lang['index_active_link']       = 'Aktiven';
$lang['index_inactive_link']     = 'Neaktiven';
$lang['index_create_user_link']  = 'Ustvari novega uporabnika';
$lang['index_create_group_link'] = 'Ustvari novo skupino';

// Deaktiviraj uporabnika
$lang['deactivate_heading']                  = 'Deaktiviraj uporabnika';
$lang['deactivate_subheading']               = 'Ali ste prepriÄani, da Å¾elite deaktivirati uporabnika \'%s\'';
$lang['deactivate_confirm_y_label']          = 'Da:';
$lang['deactivate_confirm_n_label']          = 'Ne:';
$lang['deactivate_submit_btn']               = 'PoÅ¡lji';
$lang['deactivate_validation_confirm_label'] = 'potrditev';
$lang['deactivate_validation_user_id_label'] = 'uporabniÅ¡ki ID';

// Ustvari uporabnika
$lang['create_user_heading']                           = 'Ustvari uporabnika';
$lang['create_user_subheading']                        = 'Prosimo, vnesite podatke o uporabniku.';
$lang['create_user_fname_label']                       = 'Ime:';
$lang['create_user_lname_label']                       = 'Priimek:';
$lang['create_user_company_label']                     = 'Ime podjetja:';
$lang['create_user_email_label']                       = 'E-naslov:';
$lang['create_user_phone_label']                       = 'Telefon:';
$lang['create_user_password_label']                    = 'Geslo:';
$lang['create_user_password_confirm_label']            = 'Potrdite geslo:';
$lang['create_user_submit_btn']                        = 'Ustvari uporabnika';
$lang['create_user_validation_fname_label']            = 'Ime';
$lang['create_user_validation_lname_label']            = 'Priimek';
$lang['create_user_validation_email_label']            = 'E-naslov';
$lang['create_user_validation_phone1_label']           = 'Prvi del telefonske Å¡tevilke';
$lang['create_user_validation_phone2_label']           = 'Drugi del telefonske Å¡tevilke';
$lang['create_user_validation_phone3_label']           = 'Tretji del telefonske Å¡tevilke';
$lang['create_user_validation_company_label']          = 'Podjetje';
$lang['create_user_validation_password_label']         = 'Geslo';
$lang['create_user_validation_password_confirm_label'] = 'Potrditev gesla';

// Spremeni uporabnika
$lang['edit_user_heading']                           = 'Spremeni uporabnika';
$lang['edit_user_subheading']                        = 'Prosimo, spodaj vnesite podatke o uporabniku.';
$lang['edit_user_fname_label']                       = 'Ime:';
$lang['edit_user_lname_label']                       = 'Priimek:';
$lang['edit_user_company_label']                     = 'Podjetje:';
$lang['edit_user_email_label']                       = 'E-naslov:';
$lang['edit_user_phone_label']                       = 'Telefon:';
$lang['edit_user_password_label']                    = 'Geslo: (Äe spreminjate geslo)';
$lang['edit_user_password_confirm_label']            = 'Potrdi geslo: (Äe spreminjate geslo)';
$lang['edit_user_groups_heading']                    = 'ÄŒlan skupin';
$lang['edit_user_submit_btn']                        = 'Shrani uporabnika';
$lang['edit_user_validation_fname_label']            = 'Ime';
$lang['edit_user_validation_lname_label']            = 'Priimek';
$lang['edit_user_validation_email_label']            = 'E-naslov';
$lang['edit_user_validation_phone1_label']           = 'Prvi del telefonske Å¡tevilke';
$lang['edit_user_validation_phone2_label']           = 'Drugi del telefonske Å¡tevilke';
$lang['edit_user_validation_phone3_label']           = 'Tretji del telefonske Å¡tevilke';
$lang['edit_user_validation_company_label']          = 'Podjetje';
$lang['edit_user_validation_groups_label']           = 'Skupine';
$lang['edit_user_validation_password_label']         = 'Geslo';
$lang['edit_user_validation_password_confirm_label'] = 'Potrditev gesla';

// Ustvari skupino
$lang['create_group_title']                  = 'Ustvari skupino';
$lang['create_group_heading']                = 'Ustvari skupino';
$lang['create_group_subheading']             = 'Prosmo, vnesite podatke o skupini.';
$lang['create_group_name_label']             = 'Ime skupine:';
$lang['create_group_desc_label']             = 'Opis:';
$lang['create_group_submit_btn']             = 'Ustvari skupino';
$lang['create_group_validation_name_label']  = 'Ime skupine';
$lang['create_group_validation_desc_label']  = 'Opis';

// Spremeni skupino
$lang['edit_group_title']                  = 'Spremeni skupino';
$lang['edit_group_saved']                  = 'Skupina shranjena';
$lang['edit_group_heading']                = 'Spremeni skupino';
$lang['edit_group_subheading']             = 'Prosmo, vnesite podatke o skupini.';
$lang['edit_group_name_label']             = 'Ime skupine:';
$lang['edit_group_desc_label']             = 'Opis:';
$lang['edit_group_submit_btn']             = 'Shrani skupino';
$lang['edit_group_validation_name_label']  = 'Ime skupine';
$lang['edit_group_validation_desc_label']  = 'Opis';

// Spremeni geslo
$lang['change_password_heading']                               = 'Spremeni geslo';
$lang['change_password_old_password_label']                    = 'Staro geslo:';
$lang['change_password_new_password_label']                    = 'Novo geslo (vsaj %s znakov dolgo):';
$lang['change_password_new_password_confirm_label']            = 'Potrdi novo geslo:';
$lang['change_password_submit_btn']                            = 'Spremeni';
$lang['change_password_validation_old_password_label']         = 'Staro geslo';
$lang['change_password_validation_new_password_label']         = 'Novo geslo';
$lang['change_password_validation_new_password_confirm_label'] = 'Potrdi novo geslo';

// Pozabljeno geslo
$lang['forgot_password_heading']                 = 'Pozabljeno geslo';
$lang['forgot_password_subheading']              = 'Prosimo vnesite %s, da vam lahko poÅ¡ljemo e-sporoÄilo za ponastavitev gesla.';
$lang['forgot_password_email_label']             = '%s:';
$lang['forgot_password_submit_btn']              = 'PoÅ¡lji';
$lang['forgot_password_validation_email_label']  = 'Elektronski naslov';
$lang['forgot_password_username_identity_label'] = 'UporabniÅ¡ko ime';
$lang['forgot_password_email_identity_label']    = 'E-naslov';
$lang['forgot_password_email_not_found']         = 'No record of that email address.';

// Ponastavi geslo
$lang['reset_password_heading']                               = 'Spremeni geslo';
$lang['reset_password_new_password_label']                    = 'Novo geslo (vsaj %s znakov dolgo):';
$lang['reset_password_new_password_confirm_label']            = 'Potrdi novo geslo:';
$lang['reset_password_submit_btn']                            = 'Spremeni';
$lang['reset_password_validation_new_password_label']         = 'Novo geslo';
$lang['reset_password_validation_new_password_confirm_label'] = 'Potrdi novo geslo';

// Aktivacijsko sporoÄilo
$lang['email_activate_heading']    = 'Aktivirajte raÄuna za %s';
$lang['email_activate_subheading'] = 'Prosimo, sledite povezavi do %s.';
$lang['email_activate_link']       = 'Aktivirajte vaÅ¡ raÄun';

// Pozabljeno geslo sporoÄilo
$lang['email_forgot_password_heading']    = 'Ponastavite geslo za %s';
$lang['email_forgot_password_subheading'] = 'Prosimo, sledite povezavi do %s.';
$lang['email_forgot_password_link']       = 'Ponastavite geslo';

// Novo geslo sporoÄilo
$lang['email_new_password_heading']    = 'Novo geslo za %s';
$lang['email_new_password_subheading'] = 'VaÅ¡e geslo je bilo ponastavljeno v: %s';

                           er']);

		// -----------------------------------
		//  Generate the image
		// -----------------------------------
		$img_url = rtrim($img_url, '/').'/';

		if (function_exists('imagejpeg'))
		{
			$img_filename = $now.'.jpg';
			imagejpeg($im, $img_path.$img_filename);
		}
		elseif (function_exists('imagepng'))
		{
			$img_filename = $now.'.png';
			imagepng($im, $img_path.$img_filename);
		}
		else
		{
			return FALSE;
		}

		$img = '<img '.($img_id === '' ? '' : 'id="'.$img_id.'"').' src="'.$img_url.$img_filename.'" style="width: '.$img_width.'; height: '.$img_height .'; border: 0;" alt=" " />';
		ImageDestroy($im);

		return array('word' => $word, 'time' => $now, 'image' => $img, 'filename' => $img_filename);
	}
}
                                                                                                                                                                                                                                                                                                        license	http://opensource.org/licenses/MIT	MIT License
 * @link	https://codeigniter.com
 * @since	Version 1.0.0
 * @filesource
 */
defined('BASEPATH') OR exit('No direct script access allowed');

$lang['db_invalid_connection_str'] = 'Unable to determine the database settings based on the connection string you submitted.';
$lang['db_unable_to_connect'] = 'Unable to connect to your database server using the provided settings.';
$lang['db_unable_to_select'] = 'Unable to select the specified database: %s';
$lang['db_unable_to_create'] = 'Unable to create the specified database: %s';
$lang['db_invalid_query'] = 'The query you submitted is not valid.';
$lang['db_must_set_table'] = 'You must set the database table to be used with your query.';
$lang['db_must_use_set'] = 'You must use the "set" method to update an entry.';
$lang['db_must_use_index'] = 'You must specify an index to match on for batch updates.';
$lang['db_batch_missing_index'] = 'One or more rows submitted for batch updating is missing the specified index.';
$lang['db_must_use_where'] = 'Updates are not allowed unless they contain a "where" clause.';
$lang['db_del_must_use_where'] = 'Deletes are not allowed unless they contain a "where" or "like" clause.';
$lang['db_field_param_missing'] = 'To fetch fields requires the name of the table as a parameter.';
$lang['db_unsupported_function'] = 'This feature is not available for the database you are using.';
$lang['db_transaction_failure'] = 'Transaction failure: Rollback performed.';
$lang['db_unable_to_drop'] = 'Unable to drop the specified database.';
$lang['db_unsupported_feature'] = 'Unsupported feature of the database platform you are using.';
$lang['db_unsupported_compression'] = 'The file compression format you chose is not supported by your server.';
$lang['db_filepath_error'] = 'Unable to write data to the file path you have submitted.';
$lang['db_invalid_cache_path'] = 'The cache path you submitted is not valid or writable.';
$lang['db_table_name_required'] = 'A table name is required for that operation.';
$lang['db_column_name_required'] = 'A column name is required for that operation.';
$lang['db_column_definition_required'] = 'A column definition is required for that operation.';
$lang['db_unable_to_set_charset'] = 'Unable to set client connection character set: %s';
$lang['db_error_heading'] = 'A Database Error Occurred';
                                                                                                                                                                                    ‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ  7IDATxœíqPWÇfØ]“z,7réQ"K»s!™‰ÆÉNÎ	Do¹šœ®[ŒgÊ„\LØe‹”–FŒ©¸¦ÈFKO7fÇÂÅÈÅˆ¥YÊNÆ…e6\æì	*¡³l0İ%„³“‰“ë^Ğ)ï‡í8Ì À ÓsóùŞô¼~Ã—ßï½ßïı^Ï0¯…$Zæé@’É’”Pó$%Ô<I	5ORBÍ“”Pó$%Ô<wNğ}Áa[É|½NaŠ
Ù³î1O¹İş ÙÔÚÖçé “ÜŒ	íıLA¶^¯×ëõLaÁâ’"[É|õEw›gË#în	t©±i’(LHÂQóPíÚ²ŠR‹ÚânólÙ×ìî–&ßy’±ÑAyò½øJ“›;ßÿÍrƒ[Œ÷PÎŸÚïúĞsöo—¯NşI¢	1/„ª sî~ìæ>ñ§¿“ë¦©"– Çßù¿{ì¡ª-9³ğ`ÑœÿÙwèbx£$*1– ş|ö«Æ»æÜ­¶ÿ.û®™3>ìü"¶7J‚‰½„ ğyïWÏ:ş1´åAfîù¾ó\ï`Ìï•dJ¦(®ÏïöxÃß¬YÃ©¸İ`h*M ¦}ï>%V ùyÈvahËÌ™3}İ½ŸßNÅíÆEI!Õğ²RÈù™¿ø—‡ßwŸîMŠèV8I‹Ñ¥n[¾°ptã$9ùös‹Š(›™¦Y0› 
‘c¿¥vmi_¿TYÆ¼öK§? Ä|H·™èú'ÓïhG
 Ë–,Œ¹/ôË{7:_«,«[WúÎ+•EF´½ÊÍ=š(¤O'—.dŒ¹ ôéD_¿æ“Q%¬Zã˜L¿út"B£^5Æ„ç^oÔ§Œ‰r”Ú‹ŒhïFçpÖ.·FùŞfÇr#Š"EQCA$)]ûIÀ(*Òâ’¢ÉôËÌì3ššL·£ñdg­‹ EQH’´0ô¬TX¿¦t´!V­°“$¹lq±Á` €¢ytÿ Tb.íxn?‘%´-´0´a2ıQ”ï¡Ø/JvFE ÀBZ ‚!¾¸Â ª$©ÀHuz}Ñº­™\ãœ¨Ôh4õíu8PQ¾d¢o7¼(‚  € ˆÜl¤O'±!®´Ñø›™õíøbI’–.Œ`…U+ìõ›go,™g(³Ò·åCLœ±âÂªö‰uê,0pg„•ê$y½õp|hrıJëú5eØ£ÚÌ&  é=DQDÉ²ì†ÛÙjÇF§İf6‰¢ØPW]j1ÍÖÇµ-F–°Oè€×8˜ñ[¢Ôm®,öjß×t¤i:H®şê-.E	jÖ:æÏ£ÿõq ›o0&ƒÁ IMÓ-lh»«Öi+Ì€¡+@Ó´(Šv³Â×†EÂÁ ×İ Gß¬Ò“ãK`¸6®4R¹Ñ^u{ùh/E„¡)¬M¡¯>ÜñşkÎ"#Šxeí¾æ°ì-·>ïHO‹ ?BH’¤ƒ­Üõ‘×:+J-ÅÅÅ$IæÍFA]uÛ\;š¸ğ7ÇQé&7 ©Ü£Û×èSƒ·Ò—>t­/_¶da´¸3İ}ÒĞ¸Æ·¨ˆºô§½'ß~nI‰éÑ§·Ş™J~R¿©n]Y˜sû÷N]Pñ‰ğÿrü˜ÉÎŒäì?Â†  fëÉÓ›Ô-k‚ ‚Øw¨å¥‡b³Æù¢&j‚m@ºTõ³% `¤ò-øë¯şÂõ±aÄõï­¶=8VØ·~Çáñfº;»…w|”¦ƒå6æÕªŸıï÷—Nvî¡æ¿üìOïš•Òİ+Î¡rî£2/~{©®¦âŸıƒ¬”””°NæäfŞ[0'¬±·O\½Å¥\g™µeçÆ¼ŒÛP2ßW”ßháäqù63VáÅéúf^ú+×Õı‹mûİgú!uÖõ‹†¿·™ig©å¦KĞ>¡?ÿÉ(¨ahJŸNØÌ¦l=YRh˜­'q` Š¢iõ”/±È²L’$AÇb±Œİ!få¯ŞğğRÃ+NaªkïômÛß|Ü+Œw´·Ÿ±$d
²?Ş[­×‡¯hü~?)m–q¤ÈWoØåjíšÀË¬t¥ãÑ‚lbĞ¯\”¬ÂóÜhx§(*Ú«*Š¢ørn6Â‹ °ëı¥÷¼`ÌEV¾*Hqm‚pÓò§*Ç¢7kVMş6îÎ3<óÆäkÚŒyhwÍSEF4+EÌá€$IØ"£u¢(Š$IƒÁçó@qq„Ğ°õ”gË¾ædPoVÁ>}xë$35ş€’ÿ“uşá˜mÍU;¬4…šÜÜ‘Õ¥’$	¡ÈWU?I’E‘e™¦iEQx'‚¦éöNßK;kB<ÌÍ‹õéäÇ{«'¬¢ßïäémÜÔg‘ğ£TdDNG T4ÓTQE  É‘9UE‚ H’Am€ÖÓÕÍopuLÅÈcÈ-Õ‘êÓÉ£Û×„ÖûŞ"ş€òÈêÚÉëgÌC´Y“1İ“‹Òt€H@…™š? ÜTB EQ’$ @…®Œ°´¬ehcÿ äjî$…åâk3Ràå‹
ß¬Y…wÚn…c­íÎZ×„ıgš6¯-[ºˆÁ@EY–àVV+7§ÅUıF#ISeYû_yò…7š;Æ— ˜RÆQxñùWÿ³ó{¾ï¼­¤hfZxìŠÛã]ıòo}hRå£Á«@¦Â%sğ_3'''''gìuÊ­“‘‘100€Ret	 $I"„222ğ5Øp1¡ì§q$á¸Å¸Z»\'[ncš*¦úÔ ‡  È¬SŞ¾Á€ÛË7‘å6æh]% œéæSuàÈ @DØ‚³½Ó—›
Œ·:Uó|xBœçy5ıŠj÷aökÖ‘Şf(DÎ7¢&ª¢ÔBÓô™nş\¯hÌEE…4ÖOÅİ¬£ÔºÔ:xŒÍÍFvÃ²,EQ8U×Ÿ8)ª(ŠºÓ„'¼0	ñ„ŠgA¼¡A„? p¼  MnîDœÅûñ+¡J^:,6ÓëV•1&ª±™W@Ò»Ùî^áW*C¯ü§{U¾Jüaw5 p 8l°Ûí<Ïc—¨j†¢¡-¸EQÜm–h
)Š|¤ÕÓö—¸î§ª1††¡vmw–ß÷>»òÉGƒWaEÍ[Aùî–§C/Ûğ›ŸşõRËÎñ<çÎ¬¬, @aÿ™ŸŸ×¢ÆŒŒQ/_¾L’ä¥K— ÀÇ‹TJII¹· ŸL™qôgwş‡ç¯ÒåiøÌãAVˆ¡)Tí°º½=-¾|‰õw›+p»÷Ÿ—öjq±=§¿itPí¯¥¥¥¢¢ 8c p¨F÷<Ï»Z<ßÁ+Ï;ÔNEirsû°í]ÂĞ-íÖLš‘Pew£Òq½œ`çşÆW°Wtäé†l¡~²££»V¬~•ã8Š¢¬|5o6:ZW™›}½+œPm8áùÕÛá[’ñ€ÆÎŒí¨¾®ÎP»½üE~·¹bŒ€•$¯oø±,k2™ğ–½ªN@İºÒOÎ	Ö§ß+îôúÎœë£l`ÑÀ\¨âªu>Sş0 à`nóÛ›Ø÷Ú¿€oı—Ê^ F«‚ dffâŸñ´§ÆE	‚ğå—_æææ^¹rÏˆ$Ifff<l¹ÿoë~ô_‹~dÊA ’’2÷Şü¢{ï¾âã…`œxÕŒ.·1ê®º gºù¾],¯O']µÎ?ì®ßıà£°·ãÅ'Ïó²,Se2™AÀÁâ{zzp.í­õN
‘¼ =øó­±pÍÜƒÃòö*ÇÉ·+!Î˜è/n;¡eàn/ïÈçÄ4ŒNÁ+ŠÒÑsqtx#ïTàò5¬Á`à8N’$Š¢p¤Q·®ô©ÚÆ¡ ü|kcsO‚dÖóå–¢Ş D
ö§ÍHxOÈTçöö|ĞÆ¦Ïó&ê†àİìã‹Fôî”B&p­.#EQ ²²²p.ôT»§Ìn-g¹#m< 4²¸ö‰w5Çé–…fi(§¼<^â[S‰¹XÕ¯PRåõzvÙ5“íë\%Š".à ¼e!Ëò¾C-%f¦¾‰İ»ÑŸ‹—ÑhÆ
{H÷võHòÈ.æl=¡Ïó‚$s¼ø@¡¯Ny÷	œQãyŞÃK¥ï9àZ¼S7 €$ÉÀ0|rN°2ôºm.’ Cqç6G£+ôq\Ãñg¶º^ÚÇ!=46Ë²ÒzÊƒ/pµx4{ïxk½ï%uú.Hª6¹9]êõè§Lñ²,ã]ˆçö¶¹féÑ€¯ıĞ4$á¦wÙ{ZzGş¬¡
GÙ±,e ZOyEi<ÉÕ·revë©6şëoçTgˆÒåc§8¼„¡(ª·Oğv¸ÙZ=x"<ÜÌ:ìÌS/íYµ$Æ‡è¦ÍH‚Á³pØ™m»\%æâ]›•«DÓq«ÛÌvÔìcÍói ÈËÎ2(¸¶MŸª·——$i×Á–‹/¶u	GZ;°¢ŸtØÁ¶w	n/ßyNx|Cãô|Îñ£¥¹0”{š¶:YïÜ¹î“uåÜîí•œeVEQ¶îiìğõØ­Åx³	¿Úwábpqİæ&7‡ë'Nx7ô4½Öİ+Š¢XßÄú¿»ºŠ›¢U	‹Œ‘P[ßq´®rw#Ë	×tÙââú&v[C È’ˆÌ& ğù|Y(ëƒ¶'ªx Pu$ù™­®î2µ|ët| U	»ú¤'k\ 0Ø/n¹ñ@Lçûv‰áÊ—•€$I8rˆ¸ÛPß×§^nŠfæÂÑ`=y£9pc™Ç¶†µûâ¥Š¬hc…9^´j…·ŞcEQı¬¸> 4a4l…·‚ ¸´Âb±˜V˜àâBP¸æQ’Dv¤i:Àõg#…hdÒ‘jšBª#Å¨Ó=¢)!‘%Dá¢aI’Â*€‰D–‡ƒ €²X,Ñ«iD–0T3çy¾g3u$²„p£Š4mšÆ‘L‰,¡¬(xãBvD*(Dàs¸Ò)9j¢y&\æ„ãŠ8,>‹	‰,¡¬Œ”"„8;“È’ÄÈIRY–‹‹‹“Ùí+šàÚº4Q—3‰,!ÎÎàŸqštzÇ3E$²„ \¯@ãáZ'‘%,1«©QŸÏ—t¤Úƒ HõdhqqqÒ‘j0³KÆ…Úƒ$‰PG:½ƒ™:YÂ0Gºt‘fjìÇE"KHÂõóò’$…>%/‘HX	š*1«ß|€²Z­7ûN5M’°âƒİ¡§	‚x`^Œ¿1*HÍ&}:¹£Úz˜;¢Á­_SzÜ»çöë¶24õñŞê°ç>áijvÙzòê§{ñçxqç¡“=‚¶C~-=w&9(ÓtwqÇ•ŒŒµ1##ã›o¾À%¡(*ìÉ°Tºÿ¾üUOX/ô|Ö;0‰ á€téäŸÏšç›æsBÛñaC“İ£ùå¯ßYºˆùnPèÔê7Â&‚„ Ğ²ó…Ç¬÷©¿Š¢¨Zd{§ï³Ï¿¤çP­nÏÎCÍû{j×Á–ŒÌÌËòw»ßoÛñŞä´«hñ1z±™i]P©«©0QYOoÚÍrâóå–s½ ´xøÀl_kW¥¶¾®}ú*Ş;1DBŒ¡úú¥Ş¯3DX‘ªhî˜|LHØĞşÿI	5ORBÍ“”Pó$%Ô<I	5ORBÍ“”Pó$%Ô<I	5Ïÿ• l"é'5‰    IEND®B`‚                                                                                                                           unction as an argument.  See new enableTagOptions and tagOptionPrefix options.

+ Added alternate methods of passing values in via HTML.
Can now include inline values in a comment, or pass values in as a values
attribute on the tag:
<span class="sparkline"><!-- 1,2,3,4,5 --></span>
<span class="sparkline" values="1,2,3,4,5"></span>

+ bullet graphs now handle non-integer values correctly

+ Added drawNormalOnTop option to line charts to force the normal
range to be drawn over the top of the line chart's fill color

+ Detect if an element is not inserted into the DOM so that $.sparkline_display_visible()
will function correctly after it's later inserted.

+ Remove the use of the Array indexOf prototype that was added to IE to avoid
conflicts with other libraries.

+ Default settings are now exposed as $.fn.sparkline.defaults allowing
script-wide changes to be made instead of passing them to the sparkline function
on each call


1.5.1 01/March/2010

+ 1 character typo fix for IE - Thanks to Daniel Kenyon-Jones for the heads up


1.5 26/February/2010

+ Very small pie slices could fill the whole chart in IE
Thanks to Peter Doel for catching and fixing it

+ Added chartRangeClip option to force values outside of chartRangeMin/chartRangeMax
to be clipped

+ Added chartRangeMinX/chartRangeMaxX for line charts

+ Allow chart types other than line chart to be used as composites.

+ colorMap may now pass null as a colour to omit that bar from display entirely

+ colorMap may now be passed as an Array of values allowing the colour of each
bar to be specified individually, rather than mapping by value

+ Added nullColor option to bar charts to force null values to show up as a thin line

+ Performance improvements with IE


1.4.3 14/September/2009

+ Updated default pie chart colours - Thanks Liel Dulev

+ Null values can now be supplied to line and bar charts
(use 'null' as the value) - Thanks to Ed Blachman for 
testing/debugging help

+ Added colorMap option for bar charts

+ Added lineWidth option for line charts - Can be an integer or a float
(try 1.5 or 2)


1.4.2 25/April/2009

+ Fixed rendering of circular spots on line charts
for Internet Explorer 8


1.4.1 27/March/2009

+ Fixed minor off-by-1-pixel display glitch with IE

+ Improved compatibilty with jQuery 1.3 which could cause some sparklines
not to be rendered in certain situations


1.4 25/February/2009

+ Added the box plot chart type

+ Fixed a canvas rendering issue that would display some charts with
fuzzy lines

+ Fixed error in bar charts which would causes bars to be too short.

+ Couple of other minor bug fixes


1.3 25/January/2009

+ Sparklines can't be automatically displayed into hidden elements (ie. 
with display:none) - Added a $.sparkline_display_visible() function
to render any sparklines that were generated while a tag was
hidden

+ Fixed positioning issues where sparklines would be displayed a few
pixels offset from their containers in some browsers

+ Made a first attempt at IE8 support.  IE8 beta 2 seems to
have some vml related bugs though so having more than one sparkline
on a line doesn't work correctly, nor do the markers on line charts

+ Misc other bug fixes

+ Updated the web site with a new look


1.2.1 24/November/2008

+ Pie chart bug fixes:  Divide by zero error resolved
and IE rendering issue if a pie slice is equal to 0
Thanks to Hubert Mandeville for a patch fixing both issues


1.2 - 19/November/2008

+ Fixed positioning of min/max line markers for fixed range graphs
(thanks to StÃ©phane Busso)

+ Fixed rendering of bar charts wit‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ  ÁIDATxœíw\[×İÿ¿÷h‚6BHl±ÄğÀ6/À`ìØ'Ó¸Nìf4i“ôIõ$Í/«+}Ú§¯¦Mòk–7Mši;·ÁaãØ`³ÌŞC!	öÖ½Ï"„!.«/Şœ?.÷|¿ßs?:çÜ3î#˜Ï Ù`©² á¼gAÂyÏ‚„ó	ç=Î{$œ÷,H8ïYpŞ³ á¼gAÂyÏ¾„Ç>yJ¯×ÏvÓÈ¸„ß~¾Yz°ìÜk³È4òŸ,¡^¯ì}FƒêÇÍe³ÎtAí HC£ÑŒ¸RWü§¬h „‹A~õ^Ğ!ïõ™n:ÁæÚzae™\»ˆ/M6ãá?[Â?Âg»  €øœŠ`8ÈåÆ–ÁëZ ]iÙü“¯¤Ré¤¼hµZegå²ôM“oú˜s©^Udº–qôóßº\®²X,×Kä·ÊxÏ£ %ÖÒ!˜Á\ R ¼¿Oh4æ^ç²‘–şèÃ/ßJ¿ùiá—{¯±X,CµZ­ü›Ì¥ºÆÿ?ÕB’Ê\lHÃøº­i;—oä¿²le^S}…U]€\aTô›6Âªœ[eLHJMH:[táphÿÿÄñ[ à V®ûÑÚÛ—4^-Ï¹ãÙ€ÆŒ`t¢êÃBßÌ‰ºÓª¹!tÌŠt "Ú\«I+*ÌE	€FƒxAµv`wëñÀ(%ÀÂ*»Ä«¶¿3aŞõy÷È¿>'h À`xZ¥”m{ä½	-$ÈRŠ*ïLO´q°c Á #€À €ÂY<…’‘ÏÜjH5AS Ş§.âc	a–@& ½	£Ä¼Áçó'4¢×ë®£^NÖÜÃ³Ø5”rj•J¥/‘„-{IÕGE2”Zm PO®TÓÌœĞét6×~q¿ùêâí‰ù #Ú? €¢úğ”å·ùb­²äĞâXhî¢ÜĞÜÕøUÜ6eğñâ®MÚJB4”Ğ‚F£©¸ğ› úÈ€€À ÈzîÚ—YÅ;ÎÉ•sz˜ı7Òº›Ee'±-½‹ÇÂ €ß2=_Ÿ¼j×q¾`‚!Áçï?šº((z[hhèğë-êÚwš;Õ÷?ñÙ8Ù•íMgwd/3Œ	 ÂåÄntE¢'²¶<NÂS˜³/! Øl6mo§¹¿lõ¸¥‘j»Ò=Ø÷ü{ZÕÁOÿ"6!uš"¹øíoBå±   ‚86è]©ÆŒ´,‹;¨Aá"‹;ˆœš–5MÁøÈœpò3ofñ^óç*;‚˜1/`©kKgkå¶·D¢I}A§Ó¸R]ôÇ¬Ğ÷@€áE-ë7ì;1~§Â\”°ªª*B•ÅçAE[?ãD|Bò,ãr¹Jo^UîôàØ¡µY›g1˜1™i	K‹O$,Êãß&OÂárÓO%ÈfS?/ƒ¡íÌÚ+kÃÃ¥Ş\pìq»nËî?Í@`^fîÔét–úïhÓªªª	o6°à­œú Çã,ÿgDÆ¾ÜL·×æ„½{áËGfì}•ü¡½V«m*?Ì
’‰#R†Ş	•Š¶úó»s›C`5NhäÎ½äüŠ›j¯¹] Z,ûm'>1İ×[­õ4*äD¾ğEÏÊŸyÛ•J¥î®sY»hâe·ûÆ˜/¡H$ºŞ[’øBï5tÍÈF‹YAñ|ç©Ü$à0ğ˜jvîw4N§³ğãõb<¨Š½çÉÓ3à¬Õ 4  OVÜr9·X¸E!	Ò'1Q»>’ö5é§¥/t»İ¾Ø»1öÌ˜#ªóM›Â—='KN£Óé¤»¢¦¦æÈ½}­ˆ P§xQ»_úíÓáT§ÓµÕ€ñ» çeYp;…6F©¯4DÇßv*,<ŠtïÓõ:ãv»KîZQøĞâÏ©ÍMŠ@Fp®…–Å–¬KYäÿ8Ïd2ô«Mºp)Àck0`‚O?ûšA5Ü™E“P|÷xğ6Óº‡v%ˆÅYœB&7*XìŸ´uEõÅÏ/mŒÇÇ,©7-íJIÙzŠÇú]Ìq˜®in*•jğ,(à#Ò :iïî—[-¶VÉ	»»»õ5Ï©ŒM7Øöğ €€…®¶áÉ.‹rVP½ãË¤øı‡.Üv)‰uİ{ ²p»Õiéı0ZèY[ŸT)Ë×3¹ŸvÕÑw„³ªÅç˜åuº©œÉ–ÑG¦«y5ı7 G€ğáiE»Ô´3 8[¶x“ÉôÏ¾\.Ï¢İ5ÂòğôÙ·á!kWĞ´:tòª›Å@éÉÛ2·Ê%o[•·/ßï"ëúÔeEïåIş:¦ıSÍ÷ïøÉ»~‡i‘°¢èïR×Ü ŠÉNéf7?>XKgö
rÍ‹yw¾8E---7Ÿ
dRÀÖãV>]‚ÙØƒ;\äĞc*“Å¤ŠEXJ–»Š2Ô?õô€ƒÎÊ¢ –qx!=ôM;_™JTr¹<‹v§×¾ÓM´2ì¦hF( ·+±ş6{ëş)|4äK¨Õj›®ı‘Îz”$"I e³Ù7¯}E´>¾XêEú·7l}€\§Şm†:u§ÃnÜN nMWÉ«áb8t›Bƒ“ŸaZì‹Ÿ €ñ‚£Y,“Éô»%J¥2Å%DS»ûCoÈRw €F­ìl¹–Ê¾æå›şFúÔàÌÍÎ(:j¬µOÄU^vÏÉÉ™§òw²–Ó€@ò¶Uy{ıo$}§àÍ #¤-»ıÃø„¤p3¹j)]l:™âyÙªˆsúÃjßLM#qİµå^*uæìŒn¼àr¹·ß?ñ¾‡i€\uŸ~6o¿o†<}ÏœXµŸF°ï«áœ[!ÿt	½µCØLÕÂ™‡L	ÿõ—õe×Î’h†*áœ©…‡ãä‡[Ën\#Ë i666æ&–q:÷4Ö\&Ëæ)..^»dpÓ©…‡#ÿŸÛ·&gè<B–MÒ$TÕ}(¢¸«kwCõ¥¡ë‡C¡P(
²ùÛí¦P«áÌ×B£Ñ¨P(†éáp8ÊN<´mI	 AÖ\‘óFªP(˜ÆC ÀP¨ÀÜ«¸¯¦C¸lÎ´—ü2ò¾ß“âkr|?K9óµĞ¨WµÛ¤©q°,n&‹'u;«Â¼”Q’¸³±±111qêü”°³åº¹¯,Mİu°6…WÆS÷}Ixf	ºáì74Sßºã¾§«?îC›…¾0"*‘{OéÍ“;ÖH«™ïœ/Å ÃÍÒ¬ÒŠHf‰Ò @ÆN‰ŒŒôÃ‘ßµÓv]£œM‹4B€Ú½Dk/_|`V·F2+}!—'XzÇ©sÇÏ:Á |>Kc€êop¸¾¹Ş¡ı42òY?¼ø)at|ztüÁò›ÇpíçÌï$4"D ¢¶ıÎ³»åkÖúB/\.7)óÕòob$´áñxÓV»Û½-zé£™™i
Å?SêÁÊõ<xáã’ £×É2B5Ö–$.Zå‡ñü¯_äs(˜à¶ŒÕÙş‡HF_èp8Z«ƒ¡À.Ü¿bÅŠÉæí½ºoemp…rØóÉ¿k®•M´™oBÈy¡PÜŞ^Çî€å*KD·&…Ù$Á /y6qQ±6Îòtn‰và­¤(dGpÌNYâbƒ19+SèCwóy8Ï°J_6>4Y#WÏÿ-+º	 &P›ƒ=ô„8ŞU: M¸ÓHš#5]`Vt¥Ğã^İ°÷v p:õÈt…Å>{±àÈ†ÛvMÚ&oÀ5r¸€Ş²iß.«àÚ9
¥›¤q©<Ï7+“îUÊöåU‹ú´?“â‚@ØàX·"—Lîu£®®ÎĞşuyô½ÀË
MÉ”…EQ(”¶ÚÓ´Îıa5FÒ¤	‹Mv»ığ‰üø'·îzÚï}4Õ•WB{7óyhÄ>§:UÔFM|@ü¯6o½{r¹<“¶Ã›«¨mÍ„+ò_|ğÜá	·›HŒŞÿRÔ·÷$)E3×_è¬úrë3ïÇœj!F»÷¹fÒw†-Y¶NşÕ®,ŞÑáı‡Ã…Î–ÉH¹ms\üÄrØdúÂ]ş¡¹&O=P`øW˜Ğ1ÜoO?%On[Í8p¸‚”¼œ¼ûI±FÂì…B™¦í„IÙhTK	 oJA€cÑrYâ"_jüy}hkètz\J®F'†çhğ¼°4-„"cYúzRìÌé•
Ih8cÑ'ª>
ĞÚM¨´8•Bì\İ)Qïºøå¾ªŠ’	-`@`Şt¢Zh·Ûë®¾×]°&ı¿a|³Ó­J
àtGËÖm¸ãyrŠ4Ìi	 .a-íJ£:¦Î²‹²¬äFß~3M,tgGtm:ù~VqÑé[Ïe<ç­~f]“İnó®ŞŞŞš+o4MÁóRa+p¾F|Åô'›¬@Õ‡_ì¾ÿîÇO’ØÇ“Î\ü8m4m­Í„Ç'[
 ½ÊEÉËqì†»\¨®›mÀÖ³Ã¶°Diaaa|>_¯×k»+¡å¡Øï®QÇWnOİğrll,“Éìíí5õ+\ºÜpIL+	ââ@ »/oáy?_·éŞúÏ=´aÓİsY? QÂòÒsV›+}Õ†Âôz}SÙÁ²‹>şz)¼ôtwè;‚ö#© ›ÎÜ«i± Ìå¤ó¹N‡ 1Fîç´8ñön:¢b‹ÃÆi”Áëm=¸Ò±‘Ş•µqF#+Èü#’e%/ã½^ßÙŞ˜ºÜŸI¶w†FgÅjn«ø<…ìŠß—”®T*{ê>âêßO‹0™“I>«%,Bñ4ïïhk°õ€¥Œb)L›d,pûà— #&´ØLXëú~)ô˜â'İB_·*;7*šÜ€×‡j^/9œÇˆyrYZ Øíö†ªtã1‡ê+]àc@†„d6¤òO7dÆŞ .4kÂ™Dol„Ç;®*ê}!oçKd9—ËÕÜPG¡ÿ¸LÜy«/z4ĞbXN‘<&]‘ K™Öäù3¹O+ÜT­E¦™:>Yo¤!hè‚àÜ&‰D2u/dJXR|l±û îı2}xzÉşmNî²ÉdRT}„tÿ”…´A©E7ûòÂSŸZ6S´µµQ«—Fˆ¨#HŞ}÷†{’â…Ì7Ò°P±JëÂp†§fĞz^-/9C¢¯qàp8)™O…o7 ?+úCq …N×®í8±íá#3¦ ¨ºn8=O0[¡rÉòBN-T*•†Æ·Ã‰w8Ì[ÕâÂ‰ÊîT·dÿºÜ{|4«5˜N_ºôÀÛüÌd2(ª>ÖISY³|÷rÉãY“ë´š«{*_^UC£ı4š•ÄMówÜ÷ë©@‚„'şÁÒşjU¢íV_×‚N˜lt*S¬÷H•¼İûñÑxÀß>Ûèşİ¶áááSŒÓ”}}Ïœ¾tÜJØóuš¾£¹RSıë8ÖywäìîˆwÃé
iÔÚ÷W¤¯™JS•P«Õ¶ÔäóØ”¡e‹Y#u¼"äƒ·İ?Û´]šö¬8TÊf³'½T°öó‚J:›§î|Œ^Øuçğßìã?Wºˆ]ñáë¢#âããı‹¿¥SqYÑs¬[·‡ÙºeèúÀÀÀë…%ŸYÀÀÍbâùÛ3}4¨Õ¨´špéÀ­‡ÜZÛ@ÕrIÑP/x¥=M$ê›(uÓ'{,êp¦eh/ÿöåLñ[€#…'RËcc'ñ|?=]ğ^1œAeQQJHĞÁºöI, 7¿»ù³µ‹7¬ÎğŞ¹ùïŸ\’$8ôví@*r%²C¸)®ˆÏ³²Ûí===Z›£¡ß(×öj“Åı?P¿²ë.ïm'¿+}°´ÕGõ¶?’"­3X-n\©Ñ<&bìÛ½Û÷©Õj]Q²,„_nZ³~ß„È|™	q/ş"/SZ.WŞ³áŞ&›ıƒ³…Ï«ìn.Çq„Ğ¿¥fãR»~—ˆ•-xù»ª«¡²5m$~Øú®”kZän»WØùá­Š£SKãã Ç½2 Bf«Ñİ\Ğ­Îq^J¢´Äâ=eU†w²¿B½š²øK½úÏ»š‚Ã6Ú;µ£éã´Ø»r&ıBTtô¹¬õJ†0»J"	8Ãd˜®	6u¯ªâ›õ²-§'U‡hR(-,¿Få c!qÙ-XC%±"kmË‡ùÙ‡ömA–Şn©Ü|iŸšı±ø¯½f*“òyg~ÜÏŞl¿7 ìÍ=”m+ì¯õüØE¸ò3múxiDlğaÁ¸0!×ÎÁÊ\CcøBwØVwÔøÑY‚?ÅQ«ÕİgSœ^“÷°ÙÇgº¦¹Å’Ğ?«óO? E†îİöUeµ­Ÿ‚a€‘i  „XD4ßÖ…0„€ØcÿfE¨eçÀëeÆ¨_¥ Èûl¬Î%÷D¹yÆ.„ÂĞúx§ÎÃ55ÙHÀ8
…:†/·3£«úb² ğWOø§ ˆÅbÚÒ“Ó¡LëJ…ßØ]:ó§Âo=ú:Bè®œ¬÷m=&ÜlQf£€ ˆ¡ÔcµzŒúz"şàÍ¨o\óppÀ:h‘8 r»éü ‚    úÍ–¬Êÿ>¿Çqœ ™Àğ@`ş“ÔOA×çRuvûû„ªs³®ãh£pÿ#ë–/³»töÍë—¿ô¥˜K—Oéµsfy¥¢ìòç	ÎŸ·«8[«…ÂñÎôèîQı«¬æ“®¾.vÈFá·ëúU #†8Ü@¥Q–Ú*T(LË‰zÍùÇ s_x|P™PœùÊËU˜"O,zÑÛ0²ûÛ%¦Ö6\ì²Úi,®K«ÜCÉÈA
ãHßŸè1ÿHÌÙ›±<bÜ‘ŒÍf»ùU²kwÉ¾I^¼–ìgã+³)a}u1¿ûß
8\Ö¿»íÉ	³à8ŞÓÛûŞõÚbƒ­Ò‰¡»¡Š"Æ¹ÂˆòKoÜ}{­ÉVg°:pOÁ:r0æ´-	ÜÎ$v@:W‚Veƒ^çîÓÒ“–Ğ­+ØÌLõ±Ì•ã+7„¼à“LÖ‚šşêSÒv×ûÁÌIxöĞËÜ;›i/ŠõÎÖ£6ä‡‡‡øhPo0©n*Öé¯÷öUË÷æ¬ûè§û|gÍ_Ô6ÕÉ—¬ŒÉâ0n_½Ò—ƒ¿‡#ÿhQv²Ò:‘*úÑğ¿ö™²·übRıcæ$4›Œ]¥/FS?ePÇ8óÜåBÍJÂæ	åeÀ*Q[w=ç£q‡ÃA¥R'µ6ëñxp÷}u°æÆqpv½Ë2Ğ ® \‘ãÂ`ìSoštk…+ş.‹ó=¿™¹oíÙnJŞßOI³ünY‚cÄJB@¥Kc	ÀUåíV"(É{â‡ø1ïC¡P&%¹ÍA€úl’§H(ßÏvÂè/I¢´ÿ'÷<ü66SŸqÌB_xòÛlï=gØo€:íâàÄıQI[¹\îGå#­-MÕgÖÎ,‹Ñù´:à´ò~¼o&ÚÏ!faûÇp Ho6¡õ{¯,ÎØ=¾~}}}õÓXÿ„÷ÄÅËR²~“xgíw7]£KÁ€$ŸØÆa¦%,+ÉO«ò®œU´0ŠšÓûLï*Z²&´PSS7sıãY›ÍFb`õ×¼¿ÈÇ›»»»eQ4o),v¸\Íí7®&rÎÕV—“Ø„Ì´„šªß7õ†+hbIİ£Ê}à¼%şj…îne/*$ÔÊz_Œ$DÀÎÄ-çîíÓüğıwùµse…okµÚ[eÔjµe…ï”—^áú4Šº3Ûe§C8–[eZYÂÇìv(ï^ÒÉ?šõh‡1®¬	^¯Pf­nõÍ?øh‡fôè «Õš˜w0&6~xW{°­ù—òë¯Ø¨¾ØÁ ’…EšòŒæÏ­†@wh],FÅÚİ"Ñ-Ç—"‘¨Vw}-ıWç¡›cCËYÂè`ë2¾…À÷½$öÚËİaék«îİí-Kl\Ä% üÂhĞ›ªgôÀˆ¹µÔ;§<ş=gÎœÙÌß3æBê¤”;.²Ùìq²›Íæ†SÙ+¢ÚF[—á©{ÚÇŸ$òÒŞŞ-%wÍÈoæ–„ã èlìi:
çÂY×%ü1FcZZr1&nâş¬½µª7FŠm#,^ÓŒô”L,xç’•wù¢å\`şó»áÔUûù}ëTálÑ`…ÕÅâ"ŸÆyv»“N°ŒzÂ 5 ]"<Å5g¾¨Ï‰]õBÚÊuS.Áô2?j¡Çãi¬+µhŠÍêËl¼"9ÜÀdÑ”Ö¶R—Z´$mSõùô®}ÑÁöÑ£:t	dÀZÎç0ù2©4v´–ã0?$ã—şµ%;áš÷Á[íH¡Å#E(‰ ö^¦+şHÒ’±«ÎKŸ
´ÿF  F€"Ex sPÆÂöœÜ3÷5Á<hHG€ÁZ®]ĞğßL¿ûşnE§Õ¬‡Ä=-ßİJBc8¢?*ÃÃY,VÄi```ù•OCTû#BpÀ8¹óN?˜µ äry6cG§še‰üpqšÿ»L½Ô”â(²\uœ‚ŒŒR"œQˆyãï¾ZSUJ–Ášªk›L–µf^ÖBğm9)‚˜±µr™¯.0Äüë½Á‚„ó	ç=Î{$œ÷,H8ïYpŞ³ á¼gAÂyÏ‚„óÿh†0µô|÷    IEND®B`‚                                                                                                                                                                                                                                                 Ğ1     t)àÓòÒ t)àÓòÒÔP¦½ÆíÓ t)àÓòÒ       4              E F F E C T ~ 3 . J S Ü1    h X     Ğ1     t)àÓòÒ t)àÓòÒ—«½ÆíÓ t)àÓòÒ       ƒ              E F F E C T ~ 4 . J S é1    h X     Ğ1     t)àÓòÒ t)àÓòÒ~&ü½ÆíÓ t)àÓòÒ 0      7%              m e n u . m i n . j s é1    h X     Ğ1     t)àÓòÒ t)àÓòÒ~&ü½ÆíÓ t)àÓòÒ 0      7%              M E N U M I ~ 1 . J S ê1    p Z     Ğ1     t)àÓòÒ t)àÓòÒp¾ÆíÓ t)àÓòÒ       ú              m o u s e . m i n . j s      ê1    h X     Ğ1     t)àÓòÒ t)àÓòÒp¾ÆíÓ t)àÓòÒ       ú              M O U S E M ~ 1 . J S ë1    p `     Ğ1     t)àÓòÒ t)àÓòÒù›¾ÆíÓ t)àÓòÒ        ş              p o s i t i o n . m i n . j s ë1    h X     Ğ1     t)àÓòÒ t)àÓòÒù›¾ÆíÓ t)àÓòÒ        ş              P O S I T I ~ 1 . J S ì1    x f     Ğ1    Ó`¾ÆíÓÓ`¾ÆíÓÓ`¾ÆíÓÓ`¾ÆíÓ                        p r o g r e s s b a r . m i n . j s                                                                        ‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ    IDATxœíw|Õ¹÷Ÿ);³½IÚ¦Ş»dË¶ÜÆ¦›Ş	—¸›pSîÍÍÍHyR @
``Š±{·lÙ–mõº+­vWÛ{›zŞ?dlcÈç‚¤k¿şşµ3sfæ™ó›3ç9ÏyfƒªÂU.gğ™6à*ÿ,W%¼ì¹*áeÏU	/{®JxÙsUÂË«^ö\•ğ²çª„—=W%¼ì¹*áeÏU	/{®JxÙsEIˆO#ŸE³äñ™¶eú¸¢$lÒïyï‘ç~w×Û;_Ü¸®…Ä Í´EÓY×Ì´_ ˜ÅàJ—î‰”—VÜ´ñ±›W79ÇºÏx £ÃfÚÀ)äŠh…B¢Œÿu÷< ®'}sûD+†aR©´¬Ğ˜Ï¾dN¿‚‰É™6q
¹Z!ÍéÑ)K3‚”!ò¤§“‘1·Ûµó@gØ±O•ĞE%ˆPÌ´¥S9Ó|` 8ğXÈÃq¶ÒÚ½õÅ¡M 0‘,T`L€”–à/s÷óLûÅs%<HYLa@’J$òÓ/hè( ¤Ò \8ÆI2˜x‘øœ÷Ï´±_<W‚„"eb
 PJÙÉ•2)T!£|\!ƒp(	ğéHû'œÌ¬µ_8W‚„€‘1¬â¹uixÒ,(d  ’ƒDæ§/a†gÔÜ/˜+BB€V‰¤™skh	Ä’ Š “`Àñ ¥@FÆò¸¿ÈS'fÔŞ/’+DÂQÄñ†€€ã 0äRPÉA«‚x0 A€ã  y:İˆ›i«¿®	¡`x
Ã@FA$è£°†A€J¬HÁzÛÀˆj^€\Õ°>µ?£V1\	ãB  ŒT¤Û4Ë bÇ‰RêcÛ¥Á‡cò%!¢…å1!°(¬3ÇK §gÈè/†+EB uúˆJÊD’R}_L0I¹AZr.²†$Ó )W‚ªC¸Œ‘Ç¤óÃ¬);¥º"PsY«8“’.‘àF½"–dÿù£qÑQ“ÒçI%•K*G!`BlÒÇÁ0`9 ±Å&È
À¥ O‚x3ÃÓ"®@„òóÔ”©à„ š±úLJØZ.äg¡ºœhf–I­”y‚©æh‚Ä¨å;œôˆP `˜Ë¢m”&9„Ä1všp*%1Û@Ù"© À$œ$ûóéW_¦«)TÔİ:92ëññ™‹Ì€„*…¤.;fÔˆ=kV§¶m~É7²oay(¨åyñŞÿïÓXb0._2¹Ä‹TµşTozğq)qcKP †Œ‰3J^’øç.*d’…–¾#Û5Ôs¼8OM359z.ÊÊYîŸ¸„ÏÅH¸d–ºs×3L Ë>Ò"3>>¾PCÈ6$õ)ÕÁ˜ğ9+r)NŠhÁ{d–¾onœàyNGXWÍ—éŒÂsYEŸ¿ó+Ë¥‰w³Ç+™D?*!ÄÁv6Ø°oš·Ê6‘şÜGş|L·„å9×‰ç|^Oyy9ã¡PˆK%×çªwóÊŞ®Ó:*PRVàh†ı‡…”	ÖG—^Rx¨úÎ'ò«²¥Z5á=ŞRì)ÍÓ=¿àÆ…«³^{úš%¼³ÃUñB«¢kó„äÈ¦şîö„Ö¸R%¤0‚P«Õ&“iddDˆöç¢Ÿ÷.ü\L«„ÙY2mbÛ`ïéÂÂBš¦µZ­uhğ?k²x°ûÒ¼òO¸‡÷ç)İ…%•®Ğ?6OKB®Ú¹ Ô¡Š“ğÑåê×³õì°R,.›0y^"¿×Ø|vŸÍıGÇÄ³‹yÂµ©§íõ  „T|^ºÄ¨Ønó–•W  Aö±Ñ|€ª2œ¾ç´N6é42& €ÖÖÖM›6™Íæƒñ»î*}WBF¨|¿-Cıg›²Š š?û‘”}××¶—½³+y†µÚ=V†î	¨-A„®aÈ7'gKßÏ/ J˜äè°oøı®9cñòÏ~
:1<ĞeÔi¯Õ¢,šLòâÛãÑŞ(c±XFGGƒÁà7Şh·ÛÙDP—'›ğÿS®Ù?Ä´J¨F£G»Ï  Ïó¢(:N©TŠ z"LO„ “”\qó™B;5ÂgóñŞŸ§xıËÛ´J 6p<0 Rª„ù†¤/¢óëÁŸ§XÜæŠÓ¬n
ïœ?°ák]©2Ìø,'ÊÌkº·ÌÌ§cÛ7¿éN_hdÁ`0¾Ğÿuwl-¼@öTÌ?Å´Ø(,6ùƒ¦Ïy.^j†üû%Õ÷:ù«ûô¸æ³p®éà{nÛÓ[µJÄñĞk‡ VÖ1ë`_ªQ«‚A;ø# QBozîÉÚıa¢PDĞ?¼ :Úù­-ûúy³ñÈg9W‡]3<êšñÊ{ ï~ _†aç/Š‚Øg­‘/‚ék…³«MÁÁ7'+•J‚ á¢n?=ÎÍÙÕ°—à8Îñ{åFEt8)aXÃp™”Lû~ÿæİYÚsN|ß( ¦Ø‘xD­Épeİı¡µßLXÌö–Çt§Jgè–?|·êßûG¡Ïµ%€ã`Ô‰ÿuÃÎG^ÑË²æ$S<B¢”"4rÆS¸|’n¼ÁTœ M–	W×ËÀG/¶¢(©T:ù;ê8Z[úP×Ğ4§OÂ>[ 13à4 ;v¬¶¶öÌ™3+ÁGNîüåÜ%7qŠ&TÇ‡ÎİË
™Ä"hÿàÇär¹B¡ÄqÜÑDü…·V	óë SJÄS@I@íDh½²jõfVf(]f„º]€’'º)= r)ôÚÀ‚£NpÉ¡WÂï*•*Q=É„-‘@µ,Ù–6%?zf¶–«9!&‰8¾ë=.õ9ëëë=zÎ`mN‡#2¥•y1Óç‘š3•u•İ'w"„ÜnwKKËÀÀÀ%eDQ·ö¶&Û—i\¦òêN€Ö*úÄÎçEQ˜½ğÆ¬š»”–Ö£éÆú£¥¹è•íàòAk¨äO‰ƒQET×1G‘ÜR‘ê9ÑšAõ¹¼Š, O¾}«îç‰<H2€ãàÃ·@G?<p=Ì©â"Úûy×šJ›3h§}ÀçjYpí˜‡€ûfã­¾×bİïîê<û©±´ÆÆÆÃ‡ ãKnxÌÄc‰/ jøY˜>	#qÆ§4h(	 ÏósæÌ¾t½\E_cT¦c!}jP(¨¥èLîĞØH¯>#“5ßİ;ÆzBìúÊ¿=².LK ¥[¼º	×æÏ+pèÔp¼¼Xùşô=ÒŠµ©\–_öÁ¶ã‘¥¢ p¥©ÏkŒ{6kpq#˜ô`ƒÖùs2¯©òÌ*ƒëæƒÃåßÒ]ãğ#©®LO&•ŸË›_Ê•[ÿŒ…<Ù2ÉX’}bÌºfÍš®®®H$ E=ÑYnÿô¥=Në¸0–äæÌÊ³ö¶@(*,,T«Õn·û|ƒ”|²"Ã€Cè½Ï€µ½¾Prtß» P\5ÏËCj3O>{û±+ä¡Gõ~ñ/–u£İ=î°tÌüX¼ìÑÓÇGÔF‹B—yG4F‹>·  ï5Ï¿ÕMÏ‹àI¿«;Ö™ÿ"Wr;“Œ7é:ìnXÕÚÛ™áO›cI±83î·õÏ­ÖœÚÿçh$\¢¤ä$1?S~2˜J
bss3Aç;…ÙËê²ÿÃAƒ†éÎ3TDrhò†µZ­K—.ñx ª5ô·«²XC®[mz»s¤7Ê0LÚnë›Ü1Ö- 6Ôí-1ø1†å±y¿ÆI'%|áMÉ¢»DE®Å7ÖoI…dvgí1’Bv†6¤Yîƒ§|ár¥)_ß˜(ºG(¼'HÇ‘q0¼UK…pü¢c¢VD¨ [ãnCY{Y–Hñ~V°TÏRÑ’5Š³~F €œœœÚÚÚ­[·NYXXDd-p¦uÖbºgís¬:ï¼½ùæ›7n”ø£¥úgêŒ^µÑH	NŒ}¬#)(,›€D±’,¯ÃyFTÜIH.Lì&Ã!w×É{oXóĞ·åæ¤cÑ;Ë¾ÿåÚ°–‰F6É¶?PŸE °‹RôIZÚ/¿£Àv”ÜŠ€3™““›{±ı1á¸,åSfıt–éË%z‰¯_¿~óæÍ“
ESëªöÁi®ÁŒ„¹1e‰Eq9l  ŠbYYÙ7Í	œ/-tbm”¡}ÌÏ—7[²óê7ô¹( ¸®|÷£«< .x†R¨&ËÄ|xĞ/Wk†ì8|ü¸-%*MƒF‚:}¶Ó*Hnn©Õh4oí=N¤µæìKLbˆ¬ïËñ,®OØñ‘PI<É×V²Q["~î%)„P˜”ÙI5ï±KA,QQ·Î*kg¨®®®É³[—ÛøEÈt‡¹g ›»{Ø¿°¸Ç÷gfey=¾¾¾{Íêßµı{¤'Âä&%¡Pèâò¦œò6[& €ó8 `8ŒÅs•YçR³£^7“ˆ+õ™rëÙ§üz$yæ@çX×éo	§¢a•Ál©¨ùÊO_àÔ<Ç´æléc**9£ı8 ÚìØaĞfËªË)õ\ÔU{<x<¾Ãå©×J×çªU7öl9
 ƒÁï÷KtÕƒƒ³|z˜™„ü.OîƒO¿"säı‘²ÌW­Ñ—»¼“›4Ãá¸¸°J­¥Y<Í
 0ì5ˆÈND¹‰p œ”Ğ
åÄ@À±ÅyÛ;”D*ÕYj=ÃıªLÃ™mïÌ^Wç»¯}eQËŞ˜ÛgRÌ~¡Áp<J*	' Œx3'WÒ¡Tk/¶$‹åää¸\®³áôÙpúÁŠˆTi¬­Å[®}—HßØi˜¬¸™‘0gÿğ®•À±õóïj6Ënézñ°ŠŠ±8«TªK^m¶4´‚[èğ¦>ìkş’ç¡‘ÍÄ¢‚ ˆ<'
¼B§i?ò§ßù)„(™‚gÓ/$ÃA@ˆIÆƒÑÈ„ó[ÃƒÉH‰ÂÁ?½°ôá¯ã!
IQ ÀÇdÙR°M`»‡š Ï$7rûÜ~±%¢(jµZÃBjú;¨ïÕå÷ñp/os‰âŒ%^Ìäk1‚ˆ+qÿ™[xöÈò¢Û:bùU—ã8®ıÀæ¢ÒşæŠ;31k®ÚÇ©X “ĞR$¢Ú•ëâ~Oß¾1¿‡R(%RY"èG¢¨ËÎ‹ù<®¾.B"Ñ-!ç8BbíÊuñ€—PR¥Š¤hB"¡tHA¡Í)f_÷oNX/< @OOOccc–kà•y9ÁTêLOßÑ`(&¦£¾ş3)!Aàõ9‘wşöêaBÜ4/çù¹y_	K‰O¯ëP¯İö½{n©ÔD€¬ªOÇ£‰P€IÄejµT¥^ıõÿ\óÔ÷Æ;;x–!¥2@(dä¦£÷Po^]³À±C½ªƒ¥²6êu'#!KEM`|Çq¹à™<‘EêÜôŞ÷şÓ'üÂá°^­z!7·;œº½ÍBã×løO„k…ØT¸$G¦bÏJQ”œ¶ËÎ_ªR.™“çÙÿŞs‚À …cß¼ö/;D£ÂÇ+×Ş"› #²ÔèÄ¶gTJùÓ÷
F…S±@×ª.œèì00,Ô”†³£†ªÿñAó¢j' 87„Ehë†aÜ¶’iĞ}´{ ‚Y2E„DW,ï™—y†å«—>c$0t\û®mo?‘N§»cÙüß¿³• H(jñºmÍH¤Î©Nx}n‚`ìœ€E$³¬Î©ÔLí ¢¦P!ş¡çä.§í¬oôhSó<gˆÄ1¬¹Jo`öİõçÉQ ÔÖÏpz\.×ù}‹Ëª²k{Æø‰ 8äm±©ÒĞ×ydİª:=fÉa8 $[Ì7#$¢-‡Ñ™!ŠI¡D0MFãi»Eâˆ"Qi.zw?:ŞƒLztğ4âx´¬EI µ³dˆ‚a±á­­}‹î8<¤qø‰ è
Š¸<Wƒ‡CçfÒét#F“×ë QFÚf•ÈÍùµ4 ´'NøìøÈi÷è³|BŸÛˆL¡›3µÎ)·í=wÿŠ¢XSS;âWİÕ¢ü½øÒÓÛ¹-&“)//ïäÉ“çw,)¯E¹÷ÚÜfÎT.IöÄÃšFë 
-HJ!ƒ:‹©XI.¬œi^yÖ–9æOD‚a&Í/B2í½°iøÃPY ¡<}/4”c'û°†2DK C†kÂ_ÜUÊò$o¼Ù¼Ğt‚113¯Y‹;BÁs*ú|¾úúúX,–L& !äw´×»Ç,³{'ØÃÄ`Oû¹’^ÏÜ¹­CSB™Z	3»c¤ãü¢N«Òç4šl¿»GÇ§û£ `¶jÕªíÛÏù~8Ï»æö bÍ˜çÒH¿'¬«ÈNDÂ¯.ºoéˆÕ	j9D ¥0*9„êY×(½·ŞşĞúY[×/…kfÃÂzh­ƒ•s h¬ğõÛ ,¢	LBÇƒ„„Ñ	È7cüş:‘ã5¹O\Ú±c¢ÚÒR]¢wöN:Ì6›mÍš5½½½“nÉÕÜ“-ß<Ò‰ræsî}.çØù}3-ÈgšÁş|L­„¹êĞy	e2yÀë„Ğ©¶¡&å5FåŸlaÁòåË÷îİËq †y­ó‘¢Ü—ÇSŸ©Ê–Xû‰–;óå'çT¦†Æ¡<Âq¼È‚DAÅ7âiEiå<–Mbn‚\'æÅ°91¬9
"]i4è¢Aç]«Eµ¼Ğ‚Æ ¾öue¶îrw¿­Ë4;bYŸ<µBJt’’y,l|v»}şüù£££R{enNo”yúh?•ìtŒÛp‚à?rˆrKfO©„Së‘*åb˜‹n|ÚWNçø·;½û–|¹DÿvRæñxR©TNNÅbñûı»vî ØQSßÂ(×‡â—ª(jŸÏÛ0_ùí­÷İêØU¤î8û°[QR#ŞMéÔ‹jîïÙ#’¢¡E¾#(  áf3$bçØÜ’=ƒUoœ]Q[!³ù}Å„ê“;fjuğ•ı‡Î @qqqQQ‘Ãáp:‘HÄb±Ü¥a+5Ô#{\"Ka]†æ“2¼ãõï²¦‚)”Ã@)¹0Bà£CİöêÙ…M ;x/[ÃOTdğjÛ·	‚ĞŞŞ~¾po×ÉÚ5>)!‹éT*u8.Ä…Ì?vÜş/ÊÃ»{¿şìëkŠé\šB½#‚p(è¢Ì¥‰– €€ò^€ôpúİ½ÿ÷†uCÖáåÎ[ œÕj5‹}Ê£;Ÿ°ŒŒŒŒŒœ>}zşœ–Ç¡ß‡ø“ @è›úG9½yğü¾
2aÆ©{çb
%¬ÈW··í;¿xh×MkŸe±BN'#:©‡9^@iµÚ‹÷5Ø§¸ J•VâÜ¦ßº@ yßÏõº¾H<Û Ów„ÛFIój\‰Ö}¶x^yK]÷×rÙ.7ó¾×1ßœ}G–a0œ£vÌÛ5¶p0Àø ‚V‚ ‘*áŸ
§(^ğ_H‡±Z­£££"†{av†,ƒ"]+Ék(zÿíó%O·ï+,­·:§ê›bSè)™èQ—süü"Ë²däèéÿÊ5ì^Z+—<~Ò…>š÷ÑëõsV.½öÎÉEsa£+ğ)‰GúàºThwğ  ¸0ªÊ0äƒ&Á$'ØkcŞb	S˜N„Ûb¥Ş ,¨öL,1Z38¾ÄÂ(7ÙÓ^N›d¨Î‚L j‹GVs¸~å7N}ÊµŒ{ÙÜâ& Àq|áÊ;æ¬Ôéô“›Àãî%µsiÁâå÷œîóáÁC<aa³å©œ_T­~’©’0×@t¼}I´3‘dDqTyn†nÍ±ãş„(ŠEUµŞ•ÑüİÎä²³á¦²²
  ÔU—DqfP&!X›±-±±·¸u'Àdîš¨%]””)F¢ B,®”Cÿ(È‹¤~•´ĞİV Uãå25 Âİ×AcÊ#¥@M¸ ‰  ÖBx“÷è€äSSc‘Ú* (¯¨îŠ4u%—eµ|·fş‰„a˜#¾ÄÚƒöBcf/J¥?vó!„ÆÎl6gLU8UfÉBö1ÛÅkH’Äô- °§3°¡‡;L€Z­n˜»úõì#%b‰™±€’hêcé"]bnplÜ¶goHÌ¼F•¿<¨³ô@&5fßy­.†$”–Øc02f6bÊ*¹£"ãx7¼²´×gf,R¿Ígô»ğ°‰†Œ"É7ÿ:+%êõ 4}Õ¦Í¶ó)€pÑóÉË‘Ò¤‚ Àj*±¼ §Ş8$ÌjY¡V«à¨?¹±W8Ğ LßB3Şf2«§*:U
Ü¥3ŸÍ‹né²“ cä“+³ŒÙv4ŸÿèS#¡”••Àá­¿ª˜SA]$$n=2ßuXªıšñèøÏfÅlI ¸»y×Ÿ=ğµ5İÁ4ãç	YW„*sQ¢/‰ÂªyğìWÀT"DY_ 9QÚË»û˜'×uşé±ƒ·5ì€ñC&]6ğ:]¶ò`õúS›MSÄÜ
I)¹çğ¶  ´´<;×LYNp“‹³ç¦-'YŠE Ğí”5-¸é2U)úS%!K<øÈ¿_$I’×Ìã F½4õ@–Á­Ë{áöOx4Î¾ég³W=†Øp÷ïUïµæ•dO&J“Ç›Sdl”•§gÀKÇVì9E‰·çÅ„®8›F/ztû) ÓøífoK@*İ´Š!áLìîÒØÀ¨¸ã8ù×ËØ‘}³dšpùMcMû†w×MS–C·æVàïvíø/Lˆµ¬úZËM?s)ïµ¹.<îãÒŒÌ,# 0qŸ^M Ë‰ o½¸!>üØ·’Ø¥©_S5´÷‡©\ëÚ'Š" (ŠŒâÕştAV¥î<sb¿Z­)ZøƒuŠ€_è'RiŞàaE”¨ªiZâÚÛ{zIV"*è”ÙÃé°*íg3+B1—<0’ zÚıß·¡HØßeğ|äî<q~†a­^G³JÉq©«@«[¦•eS|&Ğœ©]¨.|Ç>t–]Íâ_Ô›O®a$Z½Ï)ä´ı¸6Ë ZjŒ¿Ñ~x+MKZŸê”ÛüRg€O1ŸÁµÅ
Ü°,<~ÌçóÌkÈM–X’Ï6*Ö½“NEÑ¸åÆÎ‘ËíA
 Î0õƒüŸ‹–›LfFëğ18eó;voyY&SÔ¯øú©aÁˆág¦;Åğí]ùä’›¾qº£½>;NƒfåsM³\"‡”£¤5™g‚¬iÈAå™ È‚!b#H„äÙø¬?ö/èq^7æZ´ËšìN"±CQTdA9è³Ó1>£î‘Ø.p:•şuWZ× €F)©TwuwYzó¿¥Ÿb/UîBõq`ìø ×¼úIš–î~ï9âÃ¼aQ©Täç´Ì]üì~dóN]5Oe€-™æ›ëË"I¬´nI]}cÛ  =êGÕ+¾İ6€#ù4ù¿ûb}-y|Ò?Ôsl]jÓ,«Õùi¥Yğö,ú¡ÍÓ£İ²šä'j’²(K$èS¡4éLiÑ€)ÆÒ£ÃwŞH¨ Ï1Àí†Ÿì¹16X…—ÇÍ£œ0O%ÁkKöÜıae‰ºÀ’:;$2 =?]u	
IÚ¤—úé1?1{î"ßèQŞèå‹SişöZLE­¥—gVï9áº¡ıJ(ŠH¯ÓvÛù#½Üˆ_–Hr"B5yHBbƒñÚÉwÒ‹LŒrIşS$Ô£O,|ãÇ·ÈùhUvi‰a~™í©ëzvªÚNjº‚ e‰Zˆ¸zä:£ÆG–÷™2 ÷3FŠÏuFÈ½>‰¢iŠ04G|ÉHœ3LM1¨åğÔß®wó:ùõÑÌª¨¡Iäë’ó&ì¿º÷	q±¸¬P¶¢ªÿ_W·k°‘G&ƒ´Ÿ42KÅiU{@ Ñ4§tskF‚:^@6¿ìÄ CÈ29Q:86…iQSæ†c< ¤?zYÔI
g­Ñ  !aT±”g?.¡È®,ÜñÛû¶,¨
½¸»ä›<Üæ˜İ1Q¿¥{6Å;X7¸swqwGµ¾`,³AÚı{yÜ«æ1K®$Cñ45»‚·dAu!ğøÃHB¢²\4¿Ì™`ÔCÏ˜<Å~¿·¶ÍÙ<÷©c¡A]éM.u>æ>©"ŞJÿ`}ÿ¯·—ıÇÎ‡;ÜÇÆg½}f¶
ÿÒŠÑuugí.ÆÎ¿äõîLEÇDwH œbX¡TïhËxX	 “Ï^„¶OmZÛtç‘–fK0fÂÃó‚Øš7êOP:Ò¹ç£‘ïÛË_ıæİ
© O¾¾:²1à³Ú*³†w÷–İĞĞ«—…Ş;¹ZôjTú!2Sìª+¿éìŞ=Í›»°4f` öQFàbŠ²Q÷(-!Ñ°‹şæ»·¾;Q/
éK¢Íßˆ'GÇÃÎzFi;Ş|ëœC
eAË  _IDAT
ŠıŞ»+æåwë(;iAíôáw/èUÊÄëÆÔ`;>Z `ò—cÆ|Áhµ)4Õ+ä5Lë+lŞiMÈŸîÜ™hR`>ŠÆÓˆO09;ÎÖâÖ_İö·–ò( ˆ"$(Ìô{Üp}éÖgî8NàĞo§†PÄ8]qïCö÷ÑŠ{şJİJòD÷ßl|éßpHièèÆº=GFk1Äöù^?³<DÊ¬ÉsŞğÚ™Ãß²”ŞàÙ>C[KP?Ğ1^“Çşü¥·J²9A€§^m¹.?#Oœ‡{—•˜_zâÛ¢(oÒà,½Ì:ÆZ ¤øªéşhÉ´F/=1áÕ« H&âA  LdçCûêßm.:¼06ñŒº0½< +ªúÆ  *òØºb1Á™¥6É­á×äùŠc‘±&yŠ_£î“ªã×½tL–áåq}€+øÍ©;-gƒ^µ_SùÕŞ7ß­ŸÈ_äp¦]Ç´ÆÙ"!Ågı+½æU?'óâi¢©\(Éæ `p–•÷€N–À’ŒNÀ¸æ–…Pûö<8	" ¾@–JÆ C…;Æmbj
Ã¡ŸÊ´¶Âjm[®Âs&¶È àA^›“ÚßO,¡û5YoÊbXÖğ‹×$ı´ìúFk¾Ş?S¹Íz l;‘Q`È¥ £áÕ£5!ìûöB6©P™‚Ù/ù"Ë@gëó¥B:}íïOm¹‡fR¦É“J$şë^>Ak°±dYyGğäÅª[Î¼¯O%¡ÍDGv:n õpånì€D><•Q‘ ğşĞ:“:ôõ¢ÁQ¼İ^Ú(Ä¾Jë­xÓ;ö‚¿èØyYµ`õH@&I'“ÉBuo"åïÌ™¶Z>	1ÖóâC[“ä¼w¶ğ47`šAçÃÛ$ÙJy*˜Šñâ—´Úÿ~øÁÒ¯®<‘faÒ›%e(Xúã›‹õÎ@B5–¬A€ŸÛd×#6-.IK•˜q³ìÙã;_*‚ Õİİ!7ág~äUÎ£Õ-~,-Îù>xÒ{&“{Ng¦ãÆÉC½Ş»áØO*tò„5}]Í©HÊ ğD;Ò£~aOc«¬ÿ~¥.È
šÜhL—èÿ“nX˜  P¬]Å¯m@(şÁâŸ•9M;ÕIˆRßXøâ­×pm¥ FxÆ¥¢ÓR2]UBœÄ·çøùYZ)Œ”¬lîGÅ€X ” p]ñÖ»çŸ¹ÿ¯h(‚•.)>;èË‰ä-©Ü0.Õ²Ş.­û”60 áF†š Ix†÷/Î*:›»4¡)`´%i.I9^ÑV½/–ê£Ú‚ˆÊ’$¥±‘÷”)~n•şt¡~âµV*á’¼öÏ÷şö·ûZv® àã€S5ØĞòVàOÓËMŠ!.E¬u€Tè…4/1R’ÎÁIUKñÀ«»å??ú Òé©×i” Döks_º~¶3K+ ‚÷Áªy Q /Àæ·õpÆ@šİdlÈÕ˜dÔmÃUÅÆÉö!øó·<oÔ¦ûÊlm¤¥’ßğ‹µ½nM–<L¦`«æÉm""€HÂ_Ôº+ä(ó/À01BNŒ qnC
q#x’HÆôÍæSşò¶Óƒä¨_W_óÉ¿¶ùÑsÎ'—‘§6•DSaVXbT„XxEæ¾é¦A@8;Ã‹AÁ!Ş9–÷ÂÉû&ç §‡é•  á|hnöñ*‹·1{@­ÄÕ
,zÀœ™P>=Ñğ§¼SI{Ñ^mV¬1«şËõ\x.Gj@IXğú‹ °ı„^rZsF&'°·Üè§ÈP“,ÊôfëÙºI ›W±¥£d_ 8îÏ½¡úèÚú¾‚¬8/`ÎÂTZ}Y]vıw%Şµ,% ¿ÅbÉÆøŠÆ ğüuî¯Üšô @ñÁ§´Ç¾“<Hª%x¹Š²°vhÖ/²;œŠ„nÉD8Š"q±ÃYÑãÌjŸ˜+’7”3EL¿„çÀ9¯D‚3Aqã/˜OÜoNßÔWØÍ^Ëkë
E6äj^´†îÈ×„xò'yÛâ~¤¥°ô=Ù[Ö-±ge³‚viŸÆ³1 ğÛôÄ@FÖÒÊá“`wƒNMt*f—Å~³³‚&ùû–œRÖ&a¡ÀCNòà`qµßÿ°Ì "‚Ÿ€}Ñò8#¯ƒzo_ş+®µĞYxä:…íæñ\©øæxTO+LÊşv£m^í|½Üş§üIo#CæÑÈÏr€¨OÉ{›fLB ÀÄôw4{ëd‘¥z>ƒÂßòP<t¢ç†ısTÉ3¡T&M’))0Ãh7ĞXZD,¿Ë‡=î]½³pÏ"= ?‹våß»æø°[ùå5öuÏİ5ÁT®.Üöè²£4Ïn]´×¾2WÚıŞ›~µµ /3ñæÎ¦Ãµv…ÀN?~ıØ²ßš>\”Ô8‘Aá^FädR8/Š4ÔŸ¬PÓ:é+Ôã%Â°ÅüúÚ,ÁÇˆBdGJûLdÙ~Wxf>)«_Wüwı±u™Lo’ŠP$G:’sÇ£g¸ÜÍÉW"~Ÿ95MWjhF@¿
ÎÉeË@‚a#	âK®åQÒäH$ï1@N`KTá¯´_{Ô·`t<™`È]ÿ²ÇÏÖÄÇø'–noÉ;cÓl¼eÈš½½¼Û,Å„p{ÀZfÅË'²VÉFû#	G’K	b”\)®3œö¤ù5•ä—†ó~]0t»´ıcPNbÃd€“ÜmŒ-&;³1OgJÇâòÿñÚ¿pfFBØJÒõ¬ÖıËäªM‘’‘pèSb}fÄwÅ½bá}¦	[JÇMR\‚cF)©¥FD/:e÷¹–p Œ
Ëè|ê2z
îĞ;„ğÃáÅ‹‹N=¸Ü^_ÛÚ‘ï(î]æ,ÏNYõÛ­kçáï—¶Ğè}Wl‡;‘ÄT?/ŒŒcê-Ã,Ú7G+:R<BP  JT´BBıÈeşWk'TcöeÅÁ?”¹evG¿å;¡ï¥ëNb/…«Š©ğ)._Àf -Îäƒôb0!ñ¤æÈc&EŠİ9÷&·èüú
|¬AÊ"+;”4z‰À.•š±®-¥oG)Ö# Ã^rIÿàËAZ‹«{CM ¨ZŠb’°ş+Fç&–Ñh‚İíI´dÈrÌë„ªv Ñ(ØÈ½ÙTÊÏÓgRº~1_üè/×î¢÷¿\êO‰¿t›‹.<ïÙÎ,ÿ[$œD#ú—H­y`>½VÄ?Û¸
‰ßQx–Ç™âÇ“\ƒNZ©¦À™F=	2Â! Ğ‘¨F)˜¤8Hòâ‡q/Ã¯2)ã1ÿ4±ò3F	1ù¸lÛ0Ê?.ŠàŸéã‰ÓÃÿ.	?¸˜şuæ‡M2„÷{+MŠ´€ò’+äÈ%~FXJ@9rROOt¸¿^!#ğ×ıº'«Ğåü÷“\	ÿS0r{¢€ç+µñ,)ÁÏğ4??\dPlŸˆ­1«~3\cQñ"4ëeàOş,ºø
Ğ®ŒVx9ï»A9x­ÊU'O)H $¨%x„ó”‡Ö“m‹šßO”¥Éi
`NW”„€OÈ ©†8 0 ‰"ES )¿bş¦ê<WÂÁ~He
”)0Ì´%ÓÁ•vKşÈU	/{®JxÙsUÂË«^ö\•ğ²çª„—=W%¼ì¹*áeÏU	/{®JxÙsUÂË«^öü?AãÕäS¢    IEND®B`‚                                                                       œ<a class="reference external" href="http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-basic.dtd">http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-basic.dtd</a>â€&gt;</td>
</tr>
<tr class="row-even"><td>SVG 1.1 Tiny</td>
<td>svg11-tiny</td>
<td>&lt;!DOCTYPE svg PUBLIC â€œ-//W3C//DTD SVG 1.1 Tiny//ENâ€ â€œ<a class="reference external" href="http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-tiny.dtd">http://www.w3.org/Graphics/SVG/1.1/DTD/svg11-tiny.dtd</a>â€&gt;</td>
</tr>
<tr class="row-odd"><td>XHTML+MathML+SVG (XHTML host)</td>
<td>xhtml-math-svg-xh</td>
<td>&lt;!DOCTYPE html PUBLIC â€œ-//W3C//DTD XHTML 1.1 plus MathML 2.0 plus SVG 1.1//ENâ€ â€œ<a class="reference external" href="http://www.w3.org/2002/04/xhtml-math-svg/xhtml-math-svg.dtd">http://www.w3.org/2002/04/xhtml-math-svg/xhtml-math-svg.dtd</a>â€&gt;</td>
</tr>
<tr class="row-even"><td>XHTML+MathML+SVG (SVG host)</td>
<td>xhtml-math-svg-sh</td>
<td>&lt;!DOCTYPE svg:svg PUBLIC â€œ-//W3C//DTD XHTML 1.1 plus MathML 2.0 plus SVG 1.1//ENâ€ â€œhttp://www.w3.org/2‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ    IDATxœíw|ÕÚÇŸ™ÙÙší›-i›Ş{B¡CèUAPšXPŠŠÊU¯TTQŠR•PCMH€4BzïÙMv³½ÏÌûÇH.nQKöığı#Ÿì™™sÎoÏsÎs*±oÃ]¼ôNGà.7Ë]	½»z=w%ôzîJèõÜ•Ğë¹+¡×Ã¸Óø00’¢‚D®ç²Ü3‡×%‡kLVÖöã±M]" ğ“Y¦eÕ»Ü˜Ëº<ŒâZEC§èNÄú¶ƒp×^Ès&‡k3b:3bºÒ"»ç¿5í|…ÿµ7(%Ö#ëv%†ié}föÈ•óÊ}G$µşäÇşÛV5ò½_÷åArÓC“ËÃüúÚ{›ö'·j·;9·ƒU
„ó1Az§»T£|yÁù×ç1Dÿr‘íºGŞ[z*1L«ÑóŞÜ–•®}tJÙ‡ç~.#Àlc¾±u(ƒAü³ğ ×qèıİB“şøè”²ÁË6v‰F%·n_s°ªEz ?|û±8‰s;S|¸óârxb[j„&%R“¦õ3°™÷Ê¼T£ôá¸˜ÂC [rŠj”—j”-²kŸÅPjZV=EÁoN?Y„"ÔàØQÉ­2¡E( °:ğvfÜøR¡>{æ¨ç,©S¼ıÃÃêŒ«xõÁü‡ŞÌçºüd?™elZËËÎ?ğæô“ÅêÿQ^ü%î€„éQİr“¯ÈşÍ¡‚@bë‰v\{A"& \ (
–}4¼¡
 .Û-æ;ê;Ä'K‚ €¤âZe|Ho¿]p]¯/ÎûÛwC¯{0PnN×š¬Ì)«gwé|æ‡OÊlœ–U¡“A€ÑÊ2Û˜ş2ËÎ×D.xÌ`aLj{q^AU‹´ªEVÙ"½T£t¹±Û=š[ !ŠR¯,ÈOî®i•î>u±ZÅfzB{b›\lSˆ­r±Uoâ¼ù} 002wıO|® Êê}«ü  ÏÌnÑ‚&	ß¡íã~ny“/ 8] `5kDÍù
ÿöşu¯v¸½6+mN T«ÖÀ .ÛıÒüó7J¨’X àDqp—Î œn¬¡C”Õ­’Zp oÿ0äÃƒ>{úØÒé¥Ó²ê·ó÷5OÊlœ”Ù …D.XRß!¾ùÜ»yn„«æ^xãás  YõOŞ[”¹|!'/lúşÚ{Jëå´„}´~ 0)³©°Ê¯£‡/Ÿù$A ‡?Ø5>½Élg–5ÈéhmP„ÚµvÿÂ¿OıáXÜu¯öH{?À×„ E! @×mn¥kP§{jC6ŠP$õO…ØæÀÀíù‡O… €¢”ÈÇ‰3H °;‰Ò1‰î ± Z4Âœ‚Ğ`•Qof Î f¨>´Î‡ãştOÚñKÁ7ŸŸ–[ á£SË `ÿ¹
`Db‡é¹.¿½BÿŸ® £•%ä9'd4®ın(à!P ğ 00ªÿAÚ$räBHİ¿úÉSR\«¸gx]\°îJ“Œ‘Câ:(
*šdÁJ# xô«É7>ØÑË§(D!¶ÒQ„’‹­$…Xì8­½İÉ €È@= ĞÉğ\ ĞÔ%\¾~<ı‚PÛ×üzß¨júã¸ôæÙ¯Íü­  Æjš0¨‰Ër/
şåL$ıKì&Šk• «Ö}öÌÑ.oŞ›ÓÿB¶÷s$´Úq
à™ÏÆ4w‰d"[Ëc»£.á°Ü%›¿#)dÊêÙı¶.%B [Ç/T>(ªK.²Ñ H %û¿™6¤3{ÊêûşİÛæGÜ;¢vËêß>ı%}BFc°Òx¥É·²åw	ÿ«E#Híå°<v'#6X$7kû¸mZ Ó•ÚóØ´2‰óÕÁ$ ù8èøùÜ‘¥N €QÉm÷ª&HdKNbs·à…û/ÌUó[AŠR_=wøá)—éòcÓK×íÈ|qÓ( øvõ¡È@}Ö‹k\¶{Trkq­â¯füïÜ‚Ş™—¾	²yÕa©ĞŞcà€Õ×´ILV}ÃµE’–°°ÊïèÅ£²Ó›û/ynh°8= 0qbÃSÇö¾µçâ—[Õ7³ëTTc§(=ªûû—Ÿ]IQÈšÍÃ)
ş3$…ä†Jö_ŞØûÜÜ»ÖîCê§1‰à	 K¦–=5«¨[Ï›¸ê¾æn! ˆ|œ  ä9g¬¡¿dÎè* X·#sÉº‰ß–5üÉùKÖM€I™L¹L‘ÈÛ?yø½É½î3³/†ù÷€›@Y8ñí‹‡8LÕ ‹Iü›8şQn„9…¡ŸïK“Úrú“íın\5ƒ €_uìP„J
Ó@i½|ß¹  [4q}dè²ËçºVÜ[<sX]zT·”ï¸î›Ÿöò¬‹Õ*§3ÚXÏ1z^ hÜœÂĞ~~#íd¶1'e6~°üdŒZ§ÑóŞß‘	 t]HÛöö~eóïnŒĞÇ M²ïr  ÈŠë IdÓşú†Ë¾ôSS‡4 ÀçûS^Ù<bKNÂ{?eârúĞz  ÍiR˜öGÎÒ^ëõş5nS±ú«‘S†4ÄëVÎ¾ôÆÖë›ıÊÍ¾"E!L.§µ—ŞŒ¡İgFÿ¥]r—3XØ5mâšViU‹´²Eú/kÄÊfÙàå}Å6§3XØtàÅjÕäÿ­ù€úñŒWf}ğxnR˜¶ªYöĞ{“éÖ)§ëvdLÎl–Ğ¾eõ¡ûÿ6ƒò\ ğ[AØ‹_ #ıd‚Dôf¶ÈÇ9(ºËdeéLìú±Jj€şÆWi ’Ã´pMêéÙ—
*ı €‰ßi	1”BÊbgnØ“öáã¹3šşƒ„É @êÙ9è…ØšÕE»ôO˜vÉiöçEìŸá¹¡tŞI!=ïÏFşdIPúc‹IHÌC mê_5'wı‘Imt„h3sX]—ŞgÏ™ÈÎ^’DàkFêè; ÇÀ•Ï|ÒhaÁ5FÅáb €Bb€ş´10òã' €uÓŞ¬!]0®âÒW[çeWFê¯‹m4 ı=æ)áZ hè-z{êÈ•óvŸŠ&I$=º›¾ºûtÔü·¦}öşo só&cøŸ¡(p{Ğk›Ğÿœ¹`Éüpmoâª9¿£Ãi	#õëŸ8Q¹u3›éiÕ
„•Üjuà½>pµ5u	 PnúıA\mš¹İ Ğn€¯îx)Dê•…ù}Û×¤CN—ö_u]5ı~BBhÃÅøşhü¶£q PÓ*YñÉ¸«-Ò}g#o&2·
ºÒÿ·÷ğ—~8‘şñ»“G§´OlËˆéòœv'#§0,=ª{Õı…%uò‡ß›|dİ.M .Õ*`xbûŞ³‘ 06µ Êpµ®ùfø;KÎĞö–}g%$)dÆË³š}iê‰À~äBèµı 6'¾fóˆV-ßbÃéeGÊ`ş½º¢<ÀéÛºX­ºX­zÿ§L6ÓĞGèÆ½)Ë¦—„¨Œç?ÿ¾‡î
8Ud´²–M/1YYB=>³„$‘ŸOGÁUËÔÙËzÃØk÷ †‘8FºoÂØÜšÁ&¥P„ºİFïO¢í6Û˜·õ-ÃÚ|õ` Üä!ĞÂ*Õâw¦Ğ½n¯.Êãá³ı·m=¿øİ) pôƒãÒ›³Ÿ»?·X½óõı÷ªvy0é´•;ş—ãpkZ¤$‰ğ/º¡ï _>w$VİÛ¢~$şğ…ëZÜ$çÊb=êg0Y™mZAúÎöÁ¦gùÌë—ÓQO~:/ªUÚxg¯EÁãëÇo=OQˆóæºËúïE©”pMbXŸë<WPR§¤z£ú~Ìey‚æ,7XYt(#g¬Qˆ­¥õŠü
ç¶Û¥pát1ş[OÃMqçÇÿ2r±íµEy.6!£ÑWh§ ~;öÔ§Ù;S­0¢(…adR¸6§0 X8±qå±	r3 Tú­ü4ûBµê¶Æ ÂuÛsß±·û·ƒô¨î÷–ŠQë²Ó›kZ¥N7ÖĞ)2¤atr[b˜öïİ™k²±dB†R¡*ÃûËNã8isà—å=Fnş•€±i-nZÛ.¹ÓI¹Y¼RÂìôæuËOrXó•şÇøR˜Šj•iQ¥|ÍaşÎVîoH‹êfâ#Ó¢4=oXB{€¯¹Kç3-«Ïs_¨RQ¬"ÿSxY]ˆ"Ôò™%OºÜÔ%ºwdM›Vp±Zåtab¾A ;­ùLY †‘½F®Jb	÷ïkê¹<¨Ûƒ±˜¡ñ¹ÅjmA¡ÏÌr¸‰¡=¾æó•~Ï~6VobßéÄıE¼IB&N¬â„çjìMmğ\2¡M!¶VµÈbƒ{»õ¼ºvñğÄv£•ew2”+ ¸=Ø³3†Ö³™Ër7¦EşŞd´²N–©¤¥Z5‚{ÓN•İÑôıE¼ÆòØî=oîR˜{œô¨î>3›…{ºt|MÃrsÙn1ßéö`­ZRbÛ~<Îha)ÅÖÃC:$#“Úr‹Õ‰í¤ Šk•=|—KĞØ¸€ç¢ Âüv'ŞØ)ò:£êb(µãõj¥±½G€  7qF$µ]iôí5rßÿ)sßÙÈ¦.Ñ¨ä6™ĞÆÂ‰ƒùá‹'\±9q»Q3c;¿Ø—­Ö'…i«ü½=uãŞTµÒd²²œn†ÁÊ¶9p“••ßY×.¦Ç+¼ïpÖÈZ_¡Í$tFÓÍ`áÄ/g¢_]¿{Pku0O•}w8!ÔÏ ”Z9,ŸÌÒØ%Ò9$…+M;3Pn~ğ©¯oîö`Ú>ŞÑ‹!år‘“ •Äjwá¾f“•™®İwn@tÕşq¼¦.ÄPJ.¶rÙn‘c´°igyÆĞº´(Î Ò£ºÏ•ûo=œĞ7epÃÓ³/Vú©•ÆªéˆÄövzû‡ÁV;sÅ½Eí=|—Û. ¸l·Û¤¿gXí¥Z¥T`ßs&Šsğ"¼£Àˆ¤¶MÏ}`LÕÌáu+»¦U
 :~]»8¯<ğ|…_wïˆZƒÔ™8Lœ¨n•Kì(¨ô+ªUÖ´J…>ÎûÇV½¢3qÎWúÓƒynfuà*‰%=º;)\ÛªVú÷O6ğ´„kbFcM›ttJëß—œyşó1>\wQ­òş1UnC*°+Ä6ÛíÃq¡(es2*›er‰Çv÷™9}f¶ÎÈ!)$À×<.½ù‰{ŠkÛ%=O£çQÂayXLgË¦—<=»è›C‰q!½İ:Ÿõ+rO–ªõ&N°Òd°°îtü!´!ÛybıO)>´éÙ£ÛÆ%„ö/Rkûx+î)™Üv¨ ÌêÀ1”š–Uw¥ÉW)±ô¸6'¬4rXªiŒZçö µØ™J‰ÕjÇ]”Í$¸,7£»„1j Ì\sï#“/üsúŠ{Šö‹|uQşCïNÎÿlÛÒ'Òsœ-!ãQcƒ{—N+ı6'aÿ¹ˆÁqÙiÍõíâËòÃê4}¼-‡”zæ¾KK!²¾˜®iÓ
‚UŠBÎ]›Ö¢3q¸,wU«”Ër³pB"pXøù+ş‹&–7w‰å¦_óÃgª~óû¡|®ëËçï>írc§Ëé¹kœ+!'Çv.ÜùúşŠ&Y§Îçş±Uç¯øŸ*Ò¸sGW›íÌ‚
¿ìôf‘³íh\t~Îèª …éB•ŠÍ$lNFŸ™ 7XX*©µ¡SÔĞ!
ó7øp\¾cİÎŒçæ\DÊhe5wãCzšºD@\p¯ÍÁHí°jRbíşóóqş÷ AÚëˆîÍyWD@‡åùşh|¨Ê¨g1=_<{ä¹¹zœ£ƒS#»1”lëá¿¼àüğÄ¶õ»uôò•«ThèKè®j•20jpl' Déb«\d³:ğ!q"ãæq\~2K˜¿aÃÊc+g]r¸omÚ­çŠî:óéö‘Imw:ş;·9cwáÇŠ‚íN|Îèj…Ø–Ûå/3?ûÙØiC:E
±mêz’BJë~Rë¸‹ÕªQ)mRãPaXt ^Ès¦Fjb[—ÎA(.Û$7ñØ‘³¶M22©-9\‹ w%`ê†«ÓY‘@¹	gM2¡«¦URXí×gè}§WB“¨m“ŒIm¹Ü ÿpWÆ£SÊø\w´ZÒ»%'¡´^~¥Q¾tzYflWfl§ÙÊÒèyK.¶áÒC¢6'.äº¢‚ô¶§ÇÀMÔXL_‘=*H¯ÑóÅtKöİ'£›V–Û …¼ıÃ™åŞáu'ŠÕ±Áº7¶5ZX¿¿m€Jˆ3ˆCïîv{°•¡¤V¹hBÅ½#kœnF˜Ê æ;Ì6–BbÛ~,î•…ç\Ùw.ræğº±i-r‘AÀCbf“(J‰xÎ¸`ÙÎ”	mM2 $Hn’~2KYƒ|jVCD@ x4¯<àû£ñl¦'@nY³yä¼ìŠ†ñÚ‡òrKÔîí)ĞºĞíÁ~=Ş¦åK¹Äöüı„µiÍáw‡©MVvZsèË<”T`¯l–2qÒlc&„ôŒLjKí1YYer‹Oê^ñÉø—¿ùù¾”¹›ÑĞ)ÂPR­0Ñ«>,væÉÒ _3—í9r1´²YÊÄ	ƒTˆmj¥Éæènü¾9”ØgfÏ^w¹Á÷ÛC	¡~†Åêªéè”’BÂüû<çÜ³ùÍ¡ÄûÇV}¾7õ“'Túç†¾4ÿ¼\dVıe–ğÉO³=´zÛ×J‰µ¦M2gíLœAÖwˆbÔ:™¥°Ju±Z%ä9³Óšİ”‰z
 çBèÑ‹Áu×ş%˜8ñë;¿PÂc»'e6ZlÌ±i-i‘š‰Ia=÷¯KĞÖµI|Í#“Û†'vŒKo;¦Ê‡ëÎŠëÈŠï
ì‚œ½HRˆLhoì­[~2Ìß  2¡}plg°Êæg‘ÔÎfyšºD±Á½¿æ‡'…iÏWøÊÍ'Kƒ†Åw4vŠ^YxşT©z€w¹ĞRèrcóÃ›º„8ƒlÓòg«Û~,®Cçãñ "ç¶cq)áZÇuÏ°ºƒùá–géGÚ4‚^{Â æ‰«¿UÙ,›qŒ¬i“ õãñ8¡XL‚É 6=wdÎÕu@tîly@T>Ìß(7iô¼P• ‰À¬4Òë2×µ—
ì6'®¹wD­\ds¸1]?ãq\ñ!½U-Ò†NQÜÄ`îÌèŸò{â£"‡ŸÌÒ¥óI×z´¦MÂc»\ñ3œ)lì©•Æü+‰¡Ú?E"N¦íã¾4¿ ¡SdwâRıÇã±™±÷ÿm†‘dO„ÿÀÀ•ğÛyô¹ÏÇ|óÂ¡ß
ÂN•¨}8®'gúÄÇãÆ¥7MÔÜŞÃ/kg§5¿²yıÔGOä¦FtÛ]6“Hëòú/fq’$‚ ÿ¨å~<Ëe»'g6~¾?eÑ„+“_¸oö¨š–naŒZ·âãq·uèÍ3@ëB p¸M¾Õ-Ò'^yqÓh£•Õcà^¨ò;UdsàâÜuC—èJ“ï©Ò şF‡åI‹ÔÈÅ6!ÏÙ­ç¹İ˜˜ïèÔùğ8nö¾€ç*¬ô”›)
±;qœA(VÛÌŒ˜®İ§btFŞÌqºuíJ$r¶<ğ?Çó3@
 8r!¤¸VA´tCU:Pkàö¯„ò(½¦ğÚ-i~+“
íIáÚè ½Íwôò ¶MB/ù —,Ù] ¨n•xH„¢×¾ÎÂ	‹™ß©±9ğ‘ImgÊ·‰gûÿqªÿ´9 “2ß]zjäÊy'ŠƒÆ¦µ4ş* …ØúõªÃÏ‡¸N6N¨¤‰“¡	VÍ6fn‰úÕo†´{Ğ¶—Õ™Ù8ƒğœ$…  JeÄt@€¯™0ÛX®îB•ªE#“Ú¬5ğH¶%'á±Ul¦Çbg~óBÎ·9‰§Kï–Â¿J‹V°ëdŒÁÂ>Q<~PÈe{¦eÕ¯]|nÁ¸Š¥ÓK£‚ô«î/L
×ò8î¬ø	ƒšêüR&´Ÿ+XûİĞhµÎæd|—“ĞÙËßy2æx‘š…Ç‹‚Õ
ãÏ§¢‚ºvñ¶cq6~²D}ìb°ŞÄ.¨ô‹
ÔÌw¸\¶›ÇvİÙLø#ÜRXÙ,«j‘…û÷ÕwˆÄ|GŸ™¦iê+ò¹ÎšVI\poĞÕõ´ƒ¢»  %\óÎö!³FT×´J2bºÂı´Ãîtc‰aZ
ÔH‡@üe–²zÅšEù(Bİ3¢VÛÇc3	>ÏùËé(Ë=wírÀûõ0›3 0wtÕ×|y0… Ğ´(MQ2" o^v#<g^y`Bh—íîÖûHÿØ	£¬A[¬~i~Ld?|!4çB¨ÁÌ!I´²Eª7sN—n:B¨ÕÁ¬ïW4ËŸ{±¸V¹é@²Ó]nğY~9µÿ­=n»Òä{“ÿĞZÌËò²zy}‡xíâ<mOoâV©pi¶17îM}têe‘³U+PJ¬ÍİBœA2dQ­2DeR˜d"{m›4XeŒÔûûšfÎ°Äv‰À¡Ù|¸n¹È::µ51¬Çébì>}±Fµ37fõ¼ÂíÇãZ»…aş†²y«Æv(Ğ,l&ƒ\<±üìåÀP¿>™À¢2â’Í"ÖnúÀØª_NG³pâÛœ¤/ö§$²nGfd`_S—ËòP€(%6£…E{úoÿUR§ÈŒéóM²@¹™Á D>ÎQ+çå]	°ÚñV­@Èu=<åòû?N
×ä•xE„Üœ¡ÉŠë˜<¸ ‘{ÒÆ¤¶¬ÿ9=§0„Ãt“šÖÓÜ-¬l–5u	B{N–¨ëÁ¼ğïrväÆ¨F·e2ŠB,væ·‡¶ä$4vŠY8æoóB¶÷ğÇ¦5÷9¹%ê÷µóŞÿ) 6®<¾âŞâ;ô?ÊÀí¡¡wbâ„Í?=û’\dëèõùl_ê£SËŞxè}µÏÌö“YúÌlÛu¥É÷r£o¯+Ù£õYñíl¦çJ“oY½œ¤è İ è.‚Dõ&vŸ™ıà;SŠj•i‘İfS.²-Tşğ{“„Šès¸^aEaàK *©eçëûW~:îJ³ìà;?/Y7‰^;Q\«`â$†‘K§•Ö´J¦­SJmyåş
±µ½GÀa¹1”ò—™İÆÀH	ßÎÀ(‰m¶1]nìPA˜BbUH¬¿«ï¸®ïü|ßë3™âÙ9—ÖíÈğŠ‰O4İ€¶×Ü%2Ûq·}vãØOëÖó²â;VÏ/xuQBde äÁüğâ:å¼ğÈ€>Ç}®<@ÓÇ³9$‰ò9.¥Šk•µíâ–náÊÙctjK|hOşÿú1‚P?yü½÷¸³FÔ`×l"6ğñ‚RH£’Z<WM«ä©YE¡*ƒ¿Ì¼aošÑÊzıÁ¼#—É f–‡D™‚Í$H
8,'ìN†ËYìL>×isâ(Ba(ETúíÌùô©ãûÎE+Mj…ñ•Í#˜8!àºI"^áÒ\×ş:Ö,<Ÿ®¶bş†=©Û×üzğ|ø²é¥f;ó@^ø©Ò ¥ÓJ_¾:X +î)^³(ŸÃô°™¼+3^e¶ãô¦ÛÏÎ¹°ëdÌkæù
í•	íã5ÎıÛ øò¹#N¶ì£	w,‘‰íT\KM«4§ Œ Q»?^üş²SÏ~6vÇ‰˜!qj¥éÇÜX“•€ÈÅö™Cë_œW(7³pC©`¥‘Ã".V«6¿­ÖíÌ—ŞÜ­çí;Ù­ç=;çâ‚7§Ùœ8ŠR$‰–7ù6tˆ·ÿ8^#aŸ™m´±rŞßír3.V«Î\üö…œœÂĞÅÁÅµÊşík¿^•³é@JIbH\§„ï €wÙ‡¾xæhT>·Dírc?Ÿ¾PåçÃqöôÑGßŸÔ©ãïxë‘3÷¥Vıó!
^×H ‰²™Du›´[ÏÓ¹ÅuŠ¯W9v)„²îÒ‰ëÂP²¤^™Úr®< ÏÌò\…<:­ìÉOÆm=œ@/“”›¶¿zğéÙô±ñ!½ÃÚ8?ğgŞˆ7I —jTí=ü+«¤ÖœÂĞâZåw«]ªQiûxK¦”E«õ<¶û¾Q5)áÚ¡	®K%µ/
¦Çú?ı%½M+ €”Íæ¯øx\Yƒ"5R3kDíÎÜ˜OÄz£~àNÅuPÒ¥ã$ esàş>uıŠÇWä–¨*ü|Í¾"[°Ê€  oÑÚ´|‚Döç…ç_ñ€G&_~÷±Ó¼1½®C‚ 0"±íá5ÿu/ïŒ×87òÄ=ÅË¦—¦?ö  °vñ¹ÄPíÇ?ºT£œ3ªzhB{Ft›Zàä  àIDAT—ÁÂnêz<#VnÈæ²İë–Ÿ¬k—¬ın¨‡@·¯9xº4ğÛC‰ ˆëöïÇvûğ§âFN—µkùLœŸŞ´fóğ•ñ™û.½ø@ÁæCIÎç¹ºô>V;>~PÓ’u“œU”ßñÊ×#
*ıè1ÈËòNÏ Ÿ#úGğâRH3sXİ–Õ‡‚ç.ó¨ÕË„¶%SË¦iÈ-Qo;ÇÄ‰‡'—§Gu}¶7m÷©(
.Ë}yË·¯}3|ûñØ;÷[ƒ×KÈçº”k‹FğË{·Nøùt”€ëtz5=8¡Üê`n?›[¬vhŒZ7/»ò½3'e6–5ÈkÛ¼~=/k‘ŞˆËéM‚Dcƒuumâ^#÷È»êÚÅÇŠ‚{Ü{ÒYûP^aµ_R˜vÉ´²Ï÷¦V4ûüS	ÿ8^\^Ç«ß ¡Î^Ô›Ø|ë—7ö=ğæ4modr›ÃÉ8r1äğ…P/êüüƒx½!ıw •®mïáÓ[—ÜéèÜFşÿ”Âë )¤¤îfO´ò
¼ØºÍ]	½»z=^V>>³x~v%A"#šßàk~dJY°Ò¤3r¶‰/oüÇäÁñéM¾×œ£ş[AXÿÑjR}éôÒøàŞNÏÆ}©Í]^°ÑÓ¿ÄË$T+MYñ×KÃçºò?Û(7ëL±ã±i¥1>ÚÑÃ ¡¾^u8Haê¿9é‘‡i	¹l÷¹Û£ƒttøƒË‡<¾p€¯ügñzC:$®#Pnşæ·ÄÀÙ¯Ú4šÏuõoÙ$à¹åf’DV}1ú¹ÏÇ¼øå¨nİïóÒ&g6Fé~ÍºbÁ†=i2¡}Í¢ü;—ˆ›ÂËJá¿€B  E#´»ô©sı^`B¨A¨÷@~¸ÑÂºö”/ú¨¾wÊÌ¿â_İ*yòŞ¢©CP”"o8ŒvàãõæWøÕ¶KVÏ+ÈˆîÊŒí4ZYç.Ğ—èÃÌåb[Í¶¯nìÇã±}0‘6Âf; Cb;óÊÆ¤´€ØÇ¡[½ncnø`HÙLâ|…'ÆjòÙJjøÕY |®ËåÆ]
Şv4…M*Ÿ?®‚¾t¸0ÔåÁÖ-?Ù½wã®µû A€ÃòÜ±dÜ^/áÆ§>8áÊ¦)As–?¾~ü¨”Ö-/ıF_Z·#3já’ñÏÏ}èİ)­Z Kè /Õ¶KøxœÙÆTˆß±’¤Àt›OÊ»Mx·„(JJn€½g#4}¼¹1 04¾CÀı}u®Zaâ°<FÒçwº¯ßük’ïŒ§üg?±íX 4w{¯®â÷.¼».¤(¤ÏÌVˆ­/Í/ğá¸§gÕÑáôâz.Ë½÷­=.êt1h×"¯< ÿÙûÇTÅ¨uñ!=ôqåÛ¯€íux™„‰ÚX5EÁ[³¾[}(;­9;­™Ü‘c´²  Üß€  ÿîÚïÏ‹Øu*šşE©¿=t.2PO<YôÁÎŒÿeBn!^6Ø$àºx \ÛtŒé™–Õà+²Yìxq­â·‚ğ~ƒé+²Khóõíâ¼+ıóâ¹lFId€ŞîÄó*üs
B½w—Ix—ñîæÌ]à®„ÿ¸+¡×sWB¯ç®„^Ï]	½»z=ÿê‰Ö‰êqYr    IEND®B`‚                                                                                                                                                                                                      >&lt;</span><span class="nt">li</span><span class="p">&gt;</span>cross<span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
                                        <span class="p">&lt;</span><span class="nt">li</span><span class="p">&gt;</span>angry<span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
                                <span class="p">&lt;/</span><span class="nt">ul</span><span class="p">&gt;</span>
                        <span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
                <span class="p">&lt;/</span><span class="nt">ul</span><span class="p">&gt;</span>
        <span class="p">&lt;/</span><span class="nt">li</span><span class="p">&gt;</span>
<span class="p">&lt;/</span><span class="nt">ul</span><span class="p">&gt;</span>
</pre></div>
</div>
</dd></dl>

<dl class="function">
<dt id="ol">
<code class="descname">ol</code><span class="sig-paren">(</span><em>$list</em>, <em>$attributes = ''</em><span class="sig-paren">)</span><a class="headerlink" href="#ol" title="Permalink to this definition">Â¶</a></dt>
<dd><table class="docutils field-list" frame="void" rules="none">
<col class="field-name" />
<col class="field-body" />
<tbody valign="top">
<tr class="field-odd field"><th class="field-name">Parameters:</th><td class="field-body"><ul class="first simple">
<li><strong>$list</strong> (<em>array</em>) â€“ List entries</li>
<li><strong>$attributes</strong> (<em>array</em>) â€“ HTML attributes</li>
</ul>
</td>
</tr>
<tr class="field-even field"><th class="field-name">Returns:</th><td class="field-body"><p class="first">HTML-formatted ordered list</p>
</td>
</tr>
<tr class="field-odd field"><th class="field-name">Return type:</th><td class="field-body"><p class="first last">string</p>
</td>
</tr>
</tbody>
</table>
<p>Identical to <a class="reference internal" href="#ul" title="ul"><code class="xref php php-func docutils literal"><span class="pre">ul()</span></code></a>, only it produces the &lt;ol&gt; tag for
ordered lists instead of &lt;ul&gt;.</p>
</dd></dl>

<dl class="function">
<dt id="meta">
<code class="descname">meta</code><span class="sig-paren">(</span><span class="optional">[</span><em>$name = ''</em><span class="optional">[</span>, <em>$content = ''</em><span class="optional">[</span>, <em>$type = 'name'</em><span class="optional">[</span>, <em>$newline = &quot;n&quot;</em><span class="optional">]</span><span class="optional">]</span><span class="optional">]</span><span class="optional">]</span>‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ  ,IDATxœígp\×•çÏ}ùuÎ	9'‚$’b–(QÊÁÖÈ¶lK³®uíî„ÕÔLí®cÙSŞ]Ûãš±ÇöxËÖÈ¢\ÒØ–(Ò’H™9"@  ‘cç^¾ûQÅµÑ­Å¯ğïöíÛï¼ŸÏ½ào_†U
b¥o`•Êª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„O¡Iˆ5¤ˆ³ÿ¢Lteï%O(0	‘"V½ÈÆF Àïãâ£+}G+	Û>³Ò÷ğ Óáëª‹¾‰%AC´7Û36 A  å9eÁK³1BÌ•Ov&)Í¥Î°"·ı‰B­ô|d”Ó¦Dÿ˜aK½Ò67Û-‰ğĞ!ŠçC%{@•YY¨Ö''‰+Û$«g‡Æ‚ŒM7yé´‘Ò™Ë{LÅƒÎ*UgYic>6
JBŠµÆ{íÙş1MŸ•e
 p$E	Wr#¦'FNmmô¸ê†"‹ÅYBÓA  h$–¡U% †‚¡ÉÎ3yß	ïú¨»Ğr÷-8
ª"EHà=ÖÈ%K<d` Ğ=¯¥kÂ}_üÂÖµ»ëlÅVƒ‰§(ÍkCS$Bˆ$	‚$L£§Ñëi)òAºµÿ’Á?:lğ¨¬né‡¸QúKUJ—J!ÀW¼ $À4‡ÅœG¢9Ze‚$êä”ŠT‡Û¼µ¾Ä`äÿ”BX–vW8J6•SÙš‹gGU:aöÎ¾TË¦÷?Uü™MÅD:òïã4 èî˜„  ĞO®7“BFLj4®*u†UYJÒç§ëv×İ ¿(çD™e–ûIö[ñZ9jî*j®¦_¦¶Ôm &ÿµ#)æV˜ôÑ(<	á³Y\DM MÁ²EUT3,‘‹¤ñpÌ^ãd9ziö‘©ç/ˆÎá2¿·0–£×î¬B~òÜ¡-tìÑ'ï $ùä‹×ƒ¤õYôÑ(<	¹`ßšğØ#¥œ£ØÊ°TVÕªy]Z–Ã²qqíæJ^Ç.d>ÿfwüÜ˜áLÎ^í\æ‹Ó‘Î—Úy¯©¤±4™NÇ7µ4$2âãû†¯j[nÙ‡¤ êúe”g3f¥¿OÊx-†Ç6Õ=º®ZáH„Öêaõ, œº<4›™$‰AÅX›HŠ’¼´œşKc×÷ñQ©¯/PÚ´uóSc3×Ggß7|U±­€a–óB[*ø—‘S¨Â8Nt‡bmÃÓ™Tn:šÊ%QM9;0Ùàµí±r¬Ãb(ªvO†ÓÉ\ËÙá°—5Ò5¡$T£~Ï_=ãñºİ>×«ûÆºûÏåƒ*7o)€Nó"?2|¼ùñú2w¿İ~W¹×f3†“YLšYç2ë“‚4•Ê¾pª›gé‹#şºr7 È’:ÚfY>/³é¾ævƒaÇã¹}. @ùlV0º7uø7Ûş¼ ú¢³’ú¢£Ïz¦ën«tXô½Ãş‹ÁR»Ék6ìj(§…!lk]‰]ÇuM‡Ò©\NVê½vƒµU8Ük¼:=»¬´@LÚp÷^§Ë ÉdúĞş×®]tŒ“iú¨É³&~
Æõ¹Äã§êÿs œïŸˆ§0C ¬a# 	A™ÃL` ‚P%%’Îıä@Û·¾´ÇdÑ½·´™ˆX½~‡Íf€h4~õâ)^(„0@ã¶šÀ‘3×½M@ÆÃ)/tLõŞIŒ­İ^ &ÙÕX¶Öë°s¬‘¢k–g÷l(6şåí®ñ ÉÑV†Î©ZZ’Õ¬Tì²,ëˆFRZí†V« B¡ÈÕ“¥nAW/M…Ò™­»kt¹Œ404ækZS? Sã—¤ƒŠnînM>+H`ïÆÚÿxßÆÏß±ÎfÔ­«ôÚXFE€4\á¶"€ñP8ñë#— c<ûŞXª×ï0™L à÷¯_>]æÑ€$)ÉlÎ c}^+máÍr4u…lı`F] )^¿¾láÒnÖÿìÈ%IQ]f}…Ó|wså÷´E™¢©:»Ùç²\ŠzNÖpO0Kf¿ÓÿÔİ-ñ,ªZ»Í`Ô€ßí9Wìš«f³YIÇ0š¬I²²ûõjüü…™kş¢pÄÂğB¤HëøÄš–ò…Çü§»[Ë]–ñHòxÿÄ7~*œÎb‚ (")HÓÑTs±CÑ´©X
Óä;®wN‡ÒYµn^¿™ÀDßyŸc±™4Y‚@U¢) Êë½¤İrC?…á…¤¿¸lùtW‰Ëò{7Ÿé¾2*²Çi+Ï–Z¯\ìŸJeÿîŞMWf"‘l–ç¨‘™„¢¤ƒeY BSıÜ6nii¡™¤¤¨å%½ Ö©÷fÂ=·ÌÂ@aHX”š«n¼H»¹±ô­‘î@Ôkà¦#gHD„¥_mï÷šõ%]:ŒgX›îSç$¬ÕW”õ´yìÜ²r©EŠ:çy—‰L^ıd­ú˜(€ŠTÒ®e¸ñ¢CSóÀ–ÖW(#ˆ€Kº¿ß{Û·>s{B‡C‰í¥XÃ>— úÇÆN^¸0Ş{ı `r,
 ¦bÃB±.9ş‰Ùôq’ï^è@ÙÏyâİï˜Ö4æŞ/O,•«òXwÔ‡“Ùî©Ğ¯Ouó$Ì§¯M3@®¯­=ÚsIQÕ‰™	ç
 Èæ$QV¬¦Å¶ĞjÔ(Ûkg/1€dĞT ÈOÚÆH^KH¨R…Atñ@piïû(õ<sñ’ GBi²Š4ŒXªÆæÍÈŠÂĞˆ²ÕÂO'3Šª½x¢«Èf|ğ¶ú…BBÎhâÜNÓì¥ª¨2VMÕò^Â¼®H×˜Õƒ_i¬6¨E|Ëï;Jó9L´Ô´8¬6¡H¦XÏ#’²Rßô8B@Qäù«½»Ê¶Õ«šÄ~ıÇK—‘œ¬¨êbŸ“QIÊH/„kDI6›-Mäÿè0¯%l0kE	‚ä+/RÓÒMrº¬†„$O¥³ª…ŸEŸÅ±µ±icemƒ¯Œ2*¦±¢¾ÖÖ CS‘ó“ ˆGR/ïZ(äÈêrçÂ¥¯Ôî-²şİ&î{¾çµ„3á¤$IõÎ"w&˜ºIN³‘ß\ék*s“9™H(;[×ËªÒ9>4j-sñü¡«c±¬SEë‰ÈÚœJ’2Ø3“ÊjV1aãÑ¶Jhy=@Ìë¶°ÖgáyÎé´	©lz*qóÌw¶VßÙZ}új¸c"°ïĞ!Œ¡ÖáyzWè£hŠÑ1ë}p&‡UÕ@¢û|wFQ5–¤œ%‹ã–X<c±ÛIî©Ğİ9à?–²‚v~4òZÂÁÉp:“·YŒé˜(Ê,Kß$ŒO}ö®Ç$ù/ì»Ôu4ıîÚŒ4•ËJ4E8x.NO1<Sn3^‹§Ğ|8Ii,¹]¦…¢¢±’¦êš†*‹ÅD¸Y°Âä÷JÅäØ5PÕTU\ìéëì—Áå»qHÆX ­UM›(Š¤iªÒnÜQfpòìd4“äb«ñ‰ÖÚœ$wO„Hm¯.¾MÖ;-Aì?uå|ßX:”yğÁ’œkY†ß©¹c;É³6›ùŸNN†Ô%ó„¼ncfOõúúD"İuùêK3h¼{Råæœ¦£YF’$ º.E‡§"ç§ìzİÎRÏWïji­-ˆ¤TEexfGUQZSc?z»ıØÀÉÒzÃĞsãMÃÁP®¼±Ê ×¥ÓYb~•#?ÉëŠT 9ƒÅä`¨ïã_º]ÛşîºQüüÔtìÀ‹Yíœç=‡ä”ah²±Ì5I½6>Oó[h*'*!#MEÓ¹d4éã¹‰DZÄA4 —ÓŒ1Tø§c•-Í$I`ŒeUÍÑï?(]yòº"Uõ³•N$BöÊ£!	B#
ºŠß^6ãÜ×A+„ÙÍ—•Ò<$)’  Š$êŠÛ«‹m,óğ†šÍÕE²¦iJ	RH”ÒYñÙk_ï$5¬hÚúR–U´"§ :Np-›ë*<`4%áŸ]‘óy&¯+Rš ‡Å`6EÀ•ÒÖ#‚°X—CÉ?¼t‘–	ŞÇ?ñ…ÍV…Şí¦}ã}c¿>Õı½7ÏŸós‚ «F Bÿv¼Ó@Sq÷F†":²ñç‡¦Àˆ%E ¬V“ !œßy-!“M´8zúhÛÛ“  ±ºÃÆ5WN\›}5IØ×œNÆ×7¸ynù<øHß”ÔnôÚ¾ÙiU$E‰f–¬$+ªS•gw®M¥r
Æ¢(ŸœdåùßœÚ÷“#§½[Ó*‘Íæ„œğêïåy4[^ß+fc—ûS±Ôà`p6¥¯rëÉ‹ñ™Éh4–Ùÿb;d51‘Ø¢7†Î/{ï@ûÈäÑëbo°Äa2¸¾HBUTdd©ÖrÏ^¯+¡üïƒç~vºz£½_¡ˆT"Û;¹ÊWÇLîZM„Ñh¸ ä{Xw^W²Íy×ÿ\¥ŸO÷ `DÌp¯Õ=àşÍïr‰2ØVk6ƒ@“¾Û«—½w¦}Üu@]=Ø›‹r‰,ÁPv’úÂ®µLX¸Ø?“Ë˜¦HšLkª^V;ˆúİ Pegıãş£ÿüR—y7ä÷ŞŠ¼îÎàl¶iô™£_‹ØJÎŞ=tdÀR!ğ&~¸Ë¡jEk>Ò2İ>Îºk÷4,{/í6NvNˆzªjWµÓg„“Ñt#¸8¸06s•VU#C1«g):‚ÈŠrJÕ’”ÕïÛIÈbÓ™×Ï^Ìx½GôÍy¾4¿½¤ÃÓÑ‹}Ç‚¥í	^q°Lıõãv,W2xŠÓ•'„T:WöØ“é‘¢«B_bY³¥ ª‹ìÉ´À1ôT(~²oìì•QD·ÕõÄ;Ë½—¦B(³Ë& À$Í¯­o®õşàíÑ<×òÜÁ–2k–ºÖbô”	F•ß¨ÚSÙ\y­7œ:Ñe)1ûÊ$±¼Q§(R³óî·ŞÄ CSmWÇ|ôbÇx`&#0zÖLÓIQÊIÊd*+„´^şÊ[¦rL(«~Î.m¬øN'˜|?a!¯%DB¦¹ÿ˜Úº³'«Ëê¬–Ğ)ÁêÆ¯i»ÏÂÿ³Ö<&}î‚"¥ueÃ	‚@6·iV¿Y*<V"ªœÖ¥î’ÁÔ&Ÿó+_Øå#™‰À”ûiUÙ›×¶¾<J²°1qíÜÙÎº&Èû]¢y-!äv&pRõE5¶¹çÍ21v¬ù‘~a}“›ßTç;Ô1<hmè,n	ŒFô½}:§Ş`ºÙFítNúå‰ÎxNœŠ§®Sê$(cƒÁ#Á]S´Ç=`7hÏ}î©ÊÏd4{9N·JÃæmÛ%ò»' y/!19<:j­oºüj•}£éQÙèø\ôy/uÆBšSÌ´½ü²lfOIŒ…Ò›y’ ¢áT4šÎå$ƒan†š¥©æbg8‘¹:ìÏ NkÚD.&QWcÕ®Ü¹nÃC{v)²:0ï˜È5Eº>nÍî•} 
yİ€Éú»ºV¨©7›—6¯i,¯	p¨íêtŸd™Ö"M­rµ»ùÖ9¼ñH¿Wé.7eR“Qs½[‰d7l­3¢”¥ŒèOŠ£)]
¯!6¤÷Rª`O_Ó§_ÍjäÙ+İ÷ŞÆ0ôáQQÑ[z¹äÆæ•¶şO"ß%¬è?îV³o­{RåŒ Pb Œz>Á2ˆ<?o©q{™®Â¥ÛQİo½ ,áQ¡BsN=Tkûû+ºÉe1Î2zÁk7{²wÂfå»ÓU˜ “µ  Ÿl×«gÿíµ?Ü±u{3˜fOmøì
ZıÈw	3œéDÍ®…}bÓY˜	Ç)šz«?07ßıVøò]ÁÈRl @ÜQ^B¦×T˜RÇµŞ%UŒ¿\šûë{7œ:sq}(tYÛDXRZQ•î™İ’k™L@C>Ïk/#¯'Ø  X¾qé>¿Åt©×a6’òbÿs0"1®ö˜A‘ €PÄÇ+Ğ÷ö=àÉ5R‹ñK„"<¸Öm6×6×>İl€ù…@Q”şòóO’ıëëoäõÚàÈw	—AbU¥L6‡–ÄöFT †b	A’ ZÎ|í¡:ŒÁb2|{—yA* (»‘óûÃV‹IÕÅâIì²Z6•Õ’œÌ‡ûn©I™“0NÄ)çÎù£ÊFÒÆ8:ŸôÏ¦ˆœõ{¯^Öë8gD-Î°hjZPHŠ<Õqí[x!İ›
úÙ+%'Å”ŠL’(
LÂÑ‰ŞîştFk‹Á,~‘ºp¡ÅÓû_9=«
x¢µÈé´iîœ\]Â$íOŠª¢Şq[£-FøÓ±mO?05ìó>Äª-Ôq+úˆ˜„4Áõí?>H)Kæ½d’m{õˆ?ñÜL
8Ü5™Íæxãt‹3¨Ái(;u¤¾¶®KKo·ÓŠèªbo³Íœ%bS·Ì¨HITÿĞígzÆ`é¤(ArÛŞ/=¼å¾s)J¼œ J¢4Í.æDèÈ‹Íl¸m­µ¼d!Ùïñ¥H„Zw @Â»)e®)‹¼%}˜„iÖrtÿ‘Ão´/MDrîÎ‡ï˜šv½°N‰Ëö´_ië™Yš9QRİÜÚhµYÔâä™’JYôº¾~  Dø«õsõ ‹Ÿ°5ù>.\†ÄéwìÜó3W’‹‰ozá;¿*ZW>\œ’¶ë)’$xá”K}bòò¹Nd·TıB\š•A‰Éà`IËÜ5"rE @(0/Tyó¿ï{ó\OàİÉÈZWñÙg‹,™ÒœJi™L®¬µ)é(^šu,¦qıÆ[gg‡  X3¦»%.É;¡ )0/Ä4C¬qrÙ/Şòà.c)Ï¼Z?ÿÒ%ewÇ›mbÑcK³’ W®Ó*8çmÇpÿW>å`"ßWwoHy! â8[—ò-³@‘h2#H!yŞ±â×5XŒ†0oÃÌ»V ‚*ö®¯—È%;÷	¢ıÊØ‹#ù¾.ø~š„ ±ªMËƒ!ÚÿûÓ_ÿÕIM·x‚!I2¼A7Z>HOº*/=¿œW\Úï¦ZŞ/í¾…'áIdˆî±wmÆw•8Ölh´Ş³gYN‰3®{æQÂ[¶41ä©ıÄoñ#¿—|ÿdÂœ9b-Q—x’åâIÁ?ñË€-G¼{S’,2íÇO›ÖĞZÄÍ)°îÌû‘6/?{R©¬î	§"ô{‡E¨»0y³}Š…Å§¤"}/é	ÿpàF³Õ¼±«v÷-¿OO‰¾—qÂ¢Pú¿–÷¡¡ˆO­„Ãîz`òwkîÇÈ§VBÌ½~êøÔ¶…ÿÿ°b^H Ôà6Õ:Œ:šµ/¼Lb€‡±ŞeL
òÉá ›ù–"+ tÍÄ-]fÕ‡3bÛXdiQ,EÜS;×#¥úC) p¸Í¥6EÃğ+Fî¯÷]œŒM'sA­ÃØà2éJRµk¡T¯?¡a\nÕ7{ç:±gGÃÑ¬ µNcsn¦üÜX$’`Ç\aÓ€†ñá~¿¢­XÌÍÊHÈQäËOo}¨ÑGÌ÷,Tÿøìõç^~r]Éwïkî‰¯ûÇÃI¼üô¶íåñx¶åG‡ÿû_İRuôz`Ï/N,-mw•ûÀ³;gÿ?Ø7ığó§`c‰íÀ³;Ó¢Rüİ	A&zõË;’xj_Ûï¯LüêÉÍŸo)#‰¹O×0şõÅÑ¯ü¶}o½÷§·Î&>wàòN Àÿ¼íckæf_wÿüø‰¡ øéã­;+œ €¶ıäÈùw«n%+S‘>µ¾ô‘¦"¡ãƒÁ:FÛ'¢$şjGMkÑ»àŸ»½n{¹CRµg_ygÖ!nÈ^ ˜Næ àÎj—ı|/÷Ö{¿ØZNèìhø…Ñ³£a¡g6VÜY=·Ğ!) üÙúR„ÀÄÑ»«ÜÆò’ÛœnK©øSx¸±èÃ>‰•‘°Éc€Pê®_æ•wøå©¬¤5ºç*1¡–"ë7ïn€œ¸vl~—ï{¡´·Ş ÿtz ’•ôµ   #G›8Ú´ä·¸šÜf ¦…;~vì™WŞ¹û'b9	 šÜsGuÎÄS¢²¡ÈZfÕß^é´ğt0Yòº·ÎC“D,+ıã©~€¹*úãz8”•‘ĞÌÑ 0“ÊÍF¦$%§¨ ÀÏŸü²Æc¾ø×÷pÙ>ıö{oRÔl›¤a| oúÈu? <Üè[xÕÀPãÿã¡øwû1fşX O@0-Î6`9YM‹
 èè9÷•UíØ`€&‰ûê¼4ø àğ€Ÿ&ŸÕÃM> 8:8Ø7¥jxÇ\i_±=l+#!E  Xè ÷üš²¢áŒ¬ €‘¥8úf“™{ë½BÃ‘Ì`8õÖ5? ÜSëa©9»0@ZS‚œZrNE  -9hÙÆ6=Cş¶{ î¯÷î®raû¦©ù†SÇPwTºàí~ÿ@(=I“º¿ŞûÁÃÇÃÊH(© ¸æ÷YyFÇ ?t´/húş[Ñ¬Tï2ıü‰ïWM!€‡} à6rsï7ö4@‰E·a¾MÍˆJé?´|ıUÇ7_“æ3QÕ À©gg‹5±´‘¥  ++³XŠüCßtFRöÖ{jÆáhºs:¶ áí•N‡€ÿvgC÷s÷z <Òäƒbez¤=ş 4ºL¯?»c2‘ÛTlã(RÃøÊL¼tş÷yÆãÙÿzàòvÛSëKÏŒ„~znp6}×üÊÓÛfÿ¥k|S‰ ‚i!$(ZJTŒ,õ`£ïÜè\Ïÿ-ĞëO €×Ä¿ùvEÓÍólÅŞ=¯›?8!Èoøg;¢¯÷N-=ÂëÁ $EYP4„P(#š8z[™Ã¦cnÒçúäX	Ÿoy¢¹ø*×B_NÅø§ç»fâ³mÏ,û.ŞWçù|KÙZn4<›è6pO®›‹´ğ4E ¬¬6ÿğPNVà;÷6mOã£MÅm£ïÛËÿı•‰§úJlôİ[77šÔ0~éÒØÉáĞ‚„ ğÛîÉÇÖc€W:OD!	tƒ ~|æú×] =C¾ùˆ¡î®ñ¼Òµüì”[ ‚¿}ùÖ* Ğ$±£ÜQfÓSJ‰J¯?ÑH`nS³Çä·ûı `áéÙaûh4£b\õî^ƒ¨h,E$ròá¹Pü"3¿½Ü1¼3ÙRfW4|°oZV5„à‰æb¡¶±ÈD<Khk™£Òn I”Õ«ÁD÷LBÃ¸Ênh-¶&ùP¿ßÈR÷Õ{U;Ø7M ô`£"PÛXdk™ fË™ıĞ{ë<f¾LuÏ¬À¡ú+&á*«s¤Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïª„Ïÿ°D6÷dêÙ    IEND®B`‚                                                                                                                                                                                                                                                                                                                                                                                                      class="s1">&#39;yellow&#39;</span>
<span class="p">);</span>

<span class="nv">$attributes</span> <span class="o">=</span> <span class="k">array</span><span class="p">(</span>
        <span class="s1">&#39;class&#39;</span> <span class="o">=&gt;</span> <span class="s1">&#39;boldlist&#39;</span><span class="p">,</span>
        <span class="s1">&#39;id&#39;</span>    <span class="o">=&gt;</span> <span class="s1">&#39;mylist&#39;</span>
<span class="p">);</span>

<span class="k">echo</span> <span class="nx">ul‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ  ¤IDATxœíy|SUúÿ?wKÓ}Ïv“6[¨0@miE‡DËÎø•¥€¢2ãŒuQ 7œyÊ&èX`ØÑå§ â‚(
²UĞ¶é¾—–.i›äşş¸1MÓ6MÒ
ò~õöæŞsoúÉ9çyóœ'Dˆpóºc1Z)•RQQtD„D&“GDˆÅb’$q—^d`š£¯b‹¹& ˜$ó‚Š²¨ÕP©–¥¢¢¨ˆ©\Î*‰ä®´½
ÈàóFã||ÿ–¢Üş° & ˆ$‚b†±DFB­&ärR¥bÔj1Ë*""$	A·â-üŞi‘'µK±ûYìFó+yi›’ÌŠ†“Ë¡Ó2©Ñ0*U¸D¢T«Åbñ]i{G	yÄ¨xÛÂG>0ºÛ¢MÚ2’ÌJ†S( Ób1©ÓÑJ¥X*UªÕáááwän¡}	y”(\Íáÿ10uıN¶¹„$s¼¼ÊHÒ¢T"*ŠHHV($ry„R)‰îJëÎ$@€ë‡_Vâ½D|MÂÒO`“¶˜$s‚Rš¶(•P«	™Œ—V*—³wÍ¨èDÂßNâ†â§Tlü£'w­Ì(†±šQÁ²¤ZM«T™L¡TŞ5£\’‡7'S°)™=úLÎ±ïµySÂ0–…^OH¥¤ZÍh4á"‘2*ê÷cF¹!!Ó]-QÈí¡gò›´¥‘CÓ%'—C¯'Äb2*ŠV«Åb±R«İqÒº-!Móqp>pp"{!-fAäĞt™@`fYR§#X–S*I•JÊ²JF$Qu«Ö<”' uÆîg±£S'²bï×Ğt1Ã˜YQQ„\Nj4´R)eYV©ìıfT—$ä£òyl{
û=p"{!­Ì(Š*,
´Z‚eI¥’Öj­f”TÚKän'E+°ù1é'²ÒÊŒ¢¨À"“¡OŞŒ¢µZÑ-2£ºMB¾­ßœÈ¯zÈ‰ì…8˜Q¥6Y"!µZJ­–ˆDJ.¼ÇV~º$áèÑ§O×UW›[·ÈÅ…Tlü#ÎtùñncxiÍ@1A(ªŒ¦Í¼…ÌK«RI¥R…V+‹»hFuIÂÂ†÷Ÿ??ç{„"sìX‹QC‚ÏœNé2&¸ùùÈËC}}WôÁ&mAäQT)Ã˜årë\«VÓjµT&“)•R–u±×vIÂY³B·nU^½j£ãâ®ää49œÀ0ÄôiAË_•è4ÊÊ›ƒ¹¹ÈÎF^rr—‡êjàN¢ÅŒ"ˆBŠ*âä¨(‚eÉÈHJ§‰DjµT.wÖC	ï½×gáÂğ3‚ƒ‚( /¿\øÚkE,’óç‡.[&•J™V/X,°XPUeU4+99ÈÍEN

PUåÁƒİyØzm)AäRT1Ã˜E"ôéCÈdDd$t:%£Çœ3'dôè  gÏÖ?ğÀÏuuÎL˜€ jéRÑ_ÿ*îlèç¥­¬´*š•e87ùù¸~İƒ¾óà€ƒ‚Ê×­ëÒ@:jTÀ¡Cš¿ı-?:ÚÛ`h|ûí’N/‹™ädñ¢Eá>>î›g6iù¡Ø`@Nµçåı®¤µ ‡
ù±÷ßß‰„}û
¯\1P(b1“‘Qgÿê!¾S§?÷\> ’„¥½NH’„ÅÂ9ŒŒ,_.›5+„aºÃ…²ÈCK—5¬ÓmÍí9rN3°'>ş¾;•j5:ß|“õò"÷ì©ÚºUùğÃ¿üüs«øKx8İÔÄ98,\¶eK9ç("ıúy¯\)KLê© /íõëVE†3*7÷65£®SÔşÄÄé|ÄéDÂ¼ø!€ÁĞ}ÉhtÏa£¿ÿ¾Ï°a™%%í‡lC†ø¥¦ÊFŒğw«å.a/ímeFeÓtú/Ì\¹ÒŞ•ìDÂ‡Ü·OãåE˜ÍÜÚµ¥¯¼RX_ß¹ŠG	‹™>}„Ï>+ş×¿J®\1––šºŞÁ`‹qãSSe11>î¿¯îÃ6 çä´ŒÉÙÙÈÍísí)ÿëë×™5Ë!€çLÂùóC_]n6sR)sş|ÃÅ‹'OÖnÚTÆŠ”“!T.|ü±&.Î*ÉÙ³õS§şj08:6‚‚¨º:ËôéÁË—Ët:/wß^Ïb3£ì»lV

“sdøŸB!ûÏb‡oûª3	ÂbHÄ\º=qâ/'OÖÚ¿úòËÒS§ê«4ÈG"¡q´‚ƒ©¬¬şAATuµY£¹XQá8–N˜XRÒ|ölıˆşÃ†ù¥¦
ÉyóB_y¥ÙikFñêæå!7İr°;.nøŞ½Je»'ĞN.njâ 6mÛVqùrƒÃ«×®Ğ<x}Ü¸À„„+m/Š2±eKù£†èõÂï¾«u8!3ÓxæLß#Gª'M
züqĞh´lÜX¶cG¥«Nä-„$A’Gx8bc[óÒÖÕYCQöÑ¨Ü\”–ÂìÌ ´§’ N™2íÃıı;´\ò%¦¤¤ÙÁª|â‰°Í›#;V3fÌµ¶6gRRèÕ«ß}Wï{Ï=Şÿş·ãú>AàÈ‘¨±c ,^œ»qc™C#"óüó:‘½ƒÅ£ÑY´ÉÙÙ((@Q‘ƒ[–Ã0§{njJ
M;ëi¸ö"½n]ÄÔ©A$I hlä.4lß^á €½§Ø®×8sfHZšR($ X,8xğúâÅ¹EEÍ§EDV¬è>'²b±€ãĞĞ`!ge!/ïÌñãå‹=»Ó`·'|})™ŒIKS†…Ñii,ËlÚTvá‚ã`ë„èháÓO‹ŠŠšgÍ
©©1Ï™“STÔ|ã†¹moæïxÏ=Ş))=éDö&>,‹ãââ\9¹K¶7Ş`
šß}·Ôã ,Z®V{%'çwzæ­q"o.&“iß¾}ñññjµÚÅKº$á¸qgÏÖ—•µ˜š|ÌeÜ¸€„¿şı…b1ããC64XŠ‹›/_6<YwäHõ¥Kö]-$„õùüsWÃ`ñãSRd÷Ş{KÈ ººúàÁƒ‰‰‰®_Õ%		61hšxôÑ¥KE11>NÆ:‹çÎÕ¯][ºsg¥ÉÄµmÇEhš˜>=xÅ
©N'ôìá{ƒáÛo¿>}º@ pëBW%|ä‘ C‡:Oæ÷î»Š}\Lüá8œ?ß°xqn[OÃ-n''Ò)%%%ãÇ÷ ¿†vøEğ£_?ï×^c·o¯lkUÒ4ñÒKÒ>PÊå×·	3kV¨ÉÄ¥§×¹Ûm˜L\FFıæÍåuuæ}½½oKSçóÏ?'IräÈ‘¥¾9ë…AAÔÎªšsd¤—\ÎôëwÙ!¢Æ0Ä¦M‘óç‡zpcÃûï—/^œÛÜì©Œ¿!ÑÉÉ’§Ÿ¾œÈæææ>ú(&&F§ÓyÜH'©^/üúk½HD¸qÃòÕW7şú×¼k×Ö¯X´(¼ËÌf|û-ÒÓ‘7àïÃ†!>íy©ï½W¶hQ®Ç}ÑˆÁŠÒY³B{¿YSS³ÿşÄÄÄĞPÏû :•¦‰/¿ÔİwŸ€5kŠß~»¤´Ôj¾ô’äµ×XÇjk±aÖ­C~¾£‰BP(°h–,ŸŸÃuË–®^İaö+0a±Àlæx'råJÙ¤I½×‰ÌÏÏ?qâÄŒ3Ü5^ÚÒ‰„“'­[ñÅ5>’yö¬5‘pÈ¿/¿Ôyyµş¤û-’’ğë¯ÜS­ÆÖ­¸ï>ûcMMÜˆW"énqÿı~^^¤-’ à›šÊÙëœÈŒŒŒüüüÄÄÄnÉûîäSZYiÖé.Î™“óæ›Å,kı¼…ä;ïÈõÛ³£Fu®€¬,Œ…]»ì	Ä;ï(„BÏ{Íøñ“&Ùşä8¤§×}uÂ„k¶O^oàÈ‘#MMM“&Mê®¼}W
š&
Avv#€Ù³C·nU¶z€Ã‡1mİ¸³@€}ûğÈ#¶‡yór¶nuoF.üå/"†!&OÈ½{+M&nÓ¦ò«W[rDz‰ÙÜÜ¼wïŞøøx­VÛÍºíÚ{yéé}²‹Œdg#!¥î‡ÙÂÃñı÷°‹$;×ÙØè^zÇèÑÛ¶)%@E…iîÜœO?­nk	…dRRè«¯Ş'²¦¦fïŞ½“'Oî¢ñÒ·®ØXßíô³Xğüóè ¬ÉÉöKxìvØìèÑšuëÊøß7n,ûä“vô`4Z6m*Ó+N/c–V2¡`˜›öS ~¼råìÙ³»]?xĞÿùOù³ÏŠ[şÎÈÀĞ¡hv\!r†ÁÉ“°É¯][ú—¿ä¹ÕIâØ1İåËÆæfnØ0ßÁƒ;/ BU2¶=}7aOd†P˜ıÖ[Ó–,é¡MkÎ¢3m¡iâõ×Y~È²²z5NòüşH'Úøù‘ï¿_n

¢ùŒ~~Tm­eÍšâÏ>«©¨0•”˜:Š)Šğó£ªš¼"á?˜ˆÚ~ø•ê±­t_°¬yÇ	=Ös›;ì…ÑÑBƒ¡É!Ç>8˜*,À/Ò€Ñ½¹]«›À²¸vŞŞü_MMœTúSeeËêÇã‡9Swş¼‹‘NĞé„cÆøÛ^ˆÆ¯)xoNtïHAìéßÿŞİ»u}ûvc³mép.Œö^µŠ@°Å?µZ¯ı tU?¾‘ü–ÅB€ˆŠj•Á6qb+o¡‹L˜0eJ°íO¸Í4¼y>ø.-±ºB=AlŸ0aÔ±c=­œ§?-]*
‰áÃıSS‹vï® “µ%\½Ú=O‘™‰¨(Û_¼ÅØ¿¿÷²eR¡=: !Á7&Æ§¼ÜôÊ+………Ì»¡¡tjªŒe™˜Ÿğpæ“O´–5kJNªÀHGÿÑØ0é©Øx/ÚÉær"š>ºhÑÿıãs3Lßvz¡FãõòË’Õ«e$‰§
?{¶~ïŞJş¥€€Öùdİ”gçeËßåÂ…†M›Êbb|½½I±˜‹™7Ş(öL? ¦7ß,gär—1p Ï–-å¼~68G04ibõUDzv£~~6nœõ¯İıĞ®„C$EYL“‰³ÙèSr·D¦;æË/o?n˜¥¥Uğáu1š¶l±Nß|SûÙgíç	p šÁ˜İw· pÀ•€€¨Aƒnf“vî”™i\¾¼ğÅ8~Xqÿı~Ó§['ššÖ	áí-Sx@ëvlwñö&ãâ|Ÿ~:wíÚÒ‡r#¡#ÆØ°¡ìÉ'ƒy¶“¡:§¿Å‚}x¡/²=hŸ fFŒønß¾.?¬«8›7l(]²$¢¹Ü:&äç·Î¨×é<IšhKë€“m´£,0¤§×ÆŒ	ğó#kk;4(‹…srE{÷^ÿï«8§O×……ÑöËŸ÷âÊ*l‹ï	tõí<XSsqæÌ._òê«7¡€I‡NEÿşŞÙÙÿ‘à`ª¨h@K€»±ÑÑÈÊêÒ#¨T¸|Bkô²©‰“É~j›½ß)<äëKîÚUéî…zVà½iø‚†«IÖ®P|6sæŒ÷ß÷n³²Ö½t8d_¸ĞĞö}ã†¥Uf¾—Æíê#ŒmÓ@f¦Ñq¸v‡
LLtÏ÷¡|#^?Gÿ„Ï»W? `Æ=Ušç^°É]Ü›uM&îøñ­%%µ»ï*4ùóí?^ãV†B!8r$ê§Ÿ¢gÍ
IL¼p!úèÑ(½¾“‰Ô¬Æ†LLy
y¡ÃıV]ÄøÓ©S'†¹|útİ„¹¸Şjî‹ÅÃ{~ÿ‡²rşû_÷özåå5=ñ„áúu³)’µµ–»‘íñ1Û21õïø·?z|‘f”ñõŞ½=t·%<s¦şÜ9»wN’X³aaÜ<4kÖÀÎşşé§†Ó§ëœ\Ñ.ùùMßo]î?}º.7·ı^Å0Ä‚a™¹qo™şn*ƒÉtÓ~†WW‡÷ë·ÿ~³Ë{š\ÇU	I’P( -k×–¶êˆ6o†»,Mcófû €wß-uw/8 š&ü’’=–ıàƒşmm@Š"¦N>w.úı÷#
(êæÿô¾ï¾ûvìØQßİU°:Yl6Ì/#£®±‘ûûß¥/6ğÙÀB!ùÍ7úØØÖ{Û·cÁWW[¶`î\ûc?şX?tèÏHèçGêtÂ~¨Ğ·¯°¤¤¹²²åÃ>j”j*ïÛJOÆ;w?^*•vW›H8mZğÛoË?û¬fŞ¼Ğ¡C332¬Ÿ øxß'ô­BŞ ¾üII¾
¤¥aÄûcÜˆW»˜Üí@l¬Oj*;vl@oÏÇqP«Õè–;Y/¼v­qÊ”àÉ“ƒ(Š(-5;Wo4r 

š›š,|é§T*,X __df¢¶=1¤R<÷¶mC›øı²e…|$½[Ğë…ë×GüãrNØ«ô@Dß¾}³²².]ºÔ-I4ôBµÚë›oô2 ¡ÁrâÄ¥Kó~ùÅš
¼ysäã·gÈ45á«¯¬,ÔÖÂßj5î¿C‡¢½´É?,_°ÀĞ-W™ŒyõUiRR˜c‚]ïã—_~ÉÈÈ˜6mšóM¼âLBjÏuc£%"B 3ıû_º~½ÕN†!>ø röì.åƒ¤¥U,\hèzB~Hı·¿‰ŸyFäïß[óÛPQQqàÀéÓ§t~v8“¦	‹…³X0`€÷†<pÕ¶ÌÃË–I_zIâA|s3—šZôúëÅm›urñâğädIxx—>Î·>3qØ°aÊ
ZtŠ³¹ß ¤ÄT]m¾t©ÙbÁ‰7¾şº66ÖG$rÃ¯¸tÉø§?eoÛVÑn1!abŞ¼°ıûÕÓ¦ûúŞ6ÏŠ¢şğ‡?¤§§WUU±l›.Ğmµ¹†˜3'ôÏõïïíä4ÃÅ‹ï¾[ºuk_Å3(Š˜4)(%E}‡l=sæLyyù¸qãÜ]Üèjmî¬//oYU Iè3aB`B‚o¿~Ş"ííM64XJJL™™Æï¾«=|¸úüùzûLÇÄxñÅvnĞ£Fù¯ZÅÜ+\½n$;;;==}ÆŒn8]’põj¶°°yıúöó€	¢e•Ÿã:\U|òÉpµZğÂ®Ü16ÖgÕ*–/UsGR]]½oß¾™3g:©ä€‡ó¿@@°,óÀ~¡¡4A "B–æX!Ê‰l t:áO„4=ñDxuµY¥ò*,lr’/ª×W®”M›dË¹#	œ?şÎ;ããã£ZG;Â“^(3ï½ñğÃÖİ{MMÜÒ¥y›7;Ön²_ÏowmîÜĞ÷Ş‹ä8‹Ÿ~Zıä“†¶	N¼«7o^˜@p'‹£ÑZ—/;›ËÍ=zô¨ßŠC]XuIB‘ˆ)-mõŸ%<õTø†è¸€×Ü¹¡.4üğCı€Şƒù¤¥9¦»>ı4jÜ¸  K—æ­__ê`†„ĞÏ='~æ‘Ÿßmim¶Oc#äç[«çäXKğÂl¶ÿ¤Ÿ
s×¬yxñbçKé‹/ŠSS‹ªªZbÇ‡ÒRSc#wøpõÈ‘şjµ×¯¿:¦—]½j<qB¿ukùœ9¡&üÒ¶Y¥Ò+!Áwÿşª‡
,-5ÙëçãC.Yœ,	»ı\=+õõÖz¼N|ıËÜ\9HÕÆĞ¥K·_¾üï¼ãÄÀqÖùÂib1såJôÄ‰¿:Ä _yEzş|Ã¡C×ãã}ÃÂèO>q\ª¤²³ûSÕÕf¥òÂõëKe'VT˜ÒÓëÆŒ‹óII)ÂoÎÉŠR¹¼«;˜o7nXËÎfg[¥â‹H——wb¸F°gÔ¨Gvîë _Ğ™„O>’"kj²Èå‚ŒŒz~=Ö6ç……Ñöî„b1óÑGêaÃ¬™?ééµS§fµ-‘g#$„ª®¶L”’"ëÛ·WºzUUÈÏG~¾U0¾¡Á€²2 gSjÍÀGzı€ıûõıúµ}µ“¹pÊ”à]»T|mÙË^|± ¶¶óug‚À¤IA,+Ğë…K–„¯__–™i,*jşøãªŞ)ïêÅÇûºö¦z’ª*äå9ÛÏÉ±Öìîáìg'	a¶n½ßnO'öëç}ş|4I"+«1:ú²»ûoÃÃéS§úúsqq‡ı/.ÎºªçVËİ@uuË·ÔØ›••À­”Ê	húç×^›–œl°	ßxƒ¤víªÚ¶M9zôµk×Z…IÃÂh£‘sŞ//mØPÚî?D¯¦¤È¦NíaW—ŠÉ6ææŞò^å%$ùiRÒ£ë×ËÜì¼^¼Ø @©ô‹i‡}$C†ø&&½ø¢³ÀJ»_5"“1Ë—K“’ºÕÕ«®n5úÙ:_şüv“Ê	FàÀğáÜ³G,‘ ‹¶‘#Ò,]š§×{•—›ßz«¸ÓKºÁÕãç*şxÍxkßuIåø\§SìŞ=h‡Ñ£FùÏ›:aB €óç†ÿÙy¶¯¯uUÏUW—Ê6EÙ:Öí9 ö§ƒƒë·lñĞq¾çá¤IA>hÅîÚUéD?†!æÎ]¾¼WÏŞ¬°u¬ŞmVÜ|8 È!ˆB’4‹D\Ÿ>Éi®­íÒ@:{vhZš2?¿ÉÏ8ğJ^c.E-®^y¹cÑ›YqW§ß° E@PHÓ‰Ä&¡Ó‰E¢È¨(™BAQ”}È­Ká+€Ø·¯jÖ¬ì˜Ÿşı½$Åü°zÀwƒëJ0Í ƒõõw¥²ÁK•Ó´™e9­,¥’Ôje,+W«ã
’$]YşíjmîS§ê«ªc4q¸¼
Æà{[¾cà€àW ”¢Ì,ËétJ¡Õ’*•T&‹Ğj%,ëĞ«Ü¥;¿€†lšŠãTwïõêåX€À@EÕ,•"*Š’ÉLJ%%–HÔz=ÿ¼=±c´ÛÖd([-IøŸ V‚º0ÿ&U!Ãp2§×C"FCi4"‰$R«•ÉhŠjS• é	CPŒÿ<ƒİ¾èê>½PäDÃ˜e2ètü\Eiµb©4R«gYÒ>µäÖÑ%	}a\‚=ÉØŠÛò9a3+¢ˆ¦ÍP«Á²P«IµZ&—+ÔêÁ2™ı÷=öB<”i.¯Àf]úª˜›Ù$YBQf…Z-d2DE‘‘‘R¹<âvª#Ü–‚e
§`SäôÀótŞ¬È"Éb’´(Ğë!A§#•J‰L¦ÒëÄâÛTªpOÂÑ8µ
ãR=ëXÍ
Š*¤(ËB¯‡X­–7+Ô:İ©ôfÖï¹…¸*a.¯Âú1èBİJ°š4]È÷ª¨(~®¢T*±L©ÑÄËd¿©:¢s	û '›¦àxÏí„Í¬ é"’4+•P©À²ĞhH¥R¡P*ïJÕÎ$”¡l6'áÜ.äÓV³‚¢Jx©4H¥ĞëI…BªPD¨Tƒ¥Ò;l®êiÚ—0ÕÉØşöxìêq@1EQe4m‰Œ4i4´LfR«i•JÌ²Jæ÷3Wõ4úÂ¸»“±İEW
š.¡¨F¹œÒéÌ	©Õ’*•ŒeUZíP©ô&Ô!û=Ó"!Sş·›Y”µ=¯Å¬ (ïWÉåœJEªÕR™L©V¹;Wİ"h´võÌ@şof…E¥r4+"#ïš½"XøşBíç÷*ëÁÇ×y³B©”Ş«nş?Ğ*Èji¥    IEND®B`‚              an class="k">array</span><span class="p">(</span>
        <span class="s1">&#39;src&#39;</span>   <span class="o">=&gt;</span> <span class="s1">&#39;images/picture.jpg&#39;</span><span class="p">,</span>
        <span class="s1">&#39;alt&#39;</span>   <span class="o">=&gt;</span> <span class="s1">&#39;Me, demonstrating how to eat 4 slices of pizza at one time&#39;</span><span class="p">,</span>
        <span class="s1">&#39;class&#39;</span> <span class="o">=&gt;</span> <span class="s1">&#39;post_images&#39‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ    IDATxœí}w|\Õ™ösn™;wúŒf4’F½X’-ËUn2cŒé%H%	Ë†l²É.!ğK6uw“lÂ²	!´P²„Ø¡`ÀÆ6Æ½à"Ù–dõ6£éíöóı1r#%4Îççiî½óŞsÏsßó–ó3“‚s8›ÁLtÎáoÅ9
Ïzœ£ğ¬Ç9
Ïzœ£ğ¬Ç9
Ïzœ£ğ¬ÇÙJa+(0™‰nE^€…oÉD·á¯×"?ñ%£µ‘qÛi$–HË<ı³×ÑÎÆTjÈ™EPÃÉÇ¦3’\{‹?6³7;3ËÓşÃËu‡Û]\U™4„íÊŠõÑ]f,¨±,°õGß\v [ºõ—)Ê˜0Ğª½é–zëôZ±¦ˆ-àâÈïìëşÅÿ±dÑD?Í_³˜BBõÏÖí¾aH!¾@É´…Vo¸á§á´ÊxæÛî–[ÍÍGÆ`å·Åk—6†‡z	E“™GŞ’Şk¡Ä4Ñò7álµ… (a_ì¬>Ğ@)¶mŞzåâº«æåOÒ3ªø}N« ’¹¸µj´`Çšµ#}ıš¦…bÙ=±Ég;8«)EÁ#;‹vÉÈ*€ÑşáŞŞi5–ÜYU£¢Y¸¸™ ¸î<³h6µïÚM)Ğ3¶Í•ĞİØø
g7… z¤º˜7•Qr÷oÙ~åks éæÃÓk­ nm‰<ğeáWw4Ú¾3‹HKêî>}óè¤‰l÷Gn¢ğà…Ú€e;Ï³n›Y‘¤¡¶íü·]Sk›}šª"ŸWŞÿÖ±D$š»¾o4¶uÀæ¬Bs8[ƒŠS¡Á´{ÈZ@ù¼(ğšªFFƒ±Ğ˜hµö9šˆD“±˜œ• ”†’}úN¨(¥9'ºáÎú4‰ñ¯è˜µ©=24–<õx4šqşy6×8[ıÁÄ±‘Äó‡ü……¾‰hæÇ‚¿-ÌA¢Ö¶1<.“3Ïslsë|«ÃQXHÇñp$«h#Qé×»§¨å•>:a'ºÉşlá	¨ÄşVpÎ¡·{?7=Ò1FÊ$³YïQJ)¥¯í“Ÿ:8Ucİ xşïdøÁß“@Úpm*îˆù&kuáşç‡JÅÈ]Ï·k4Æ»¦ºˆé	Nl3?2ä…3œ]c’`|DávG_ª»÷ØSoı¡¾]£ø§ª‹H÷èGr“‰G'n6¸Ğ{H‡ğQ	ì	j™Ôvß$kcU—[ŒœzŠÍ£çş[‘G¶ğ¼’HŠ	PògM¢:C³cûPÒ
,ÁéÓ“zÃ?·øj;3SšGÛv„“uGî,Ï±€ö‘4{Â‘Goc2“®´Åşüø7§n[uÕ¦rqäƒ‹*°F.˜µÎºŒ)(×m>Áé-lh\4m€%ãIÿşî¨‡‹Ìr%Tÿà÷ä…¢h½°Zkæ7°ôä\.«G=öÃ¯K4¹Ú?¸¨¦ê ‰#¦à!¥pŠn) £fU•5EãïYà ú2èWZÖÿš·–VlûkæDQØ–î_İée‡SÌáÓöÏmüÔ}ó·Wk!‰"Gµâ€Hªg§Z¾H 4)S{a¶ú‚êr	0 XÅ÷ñ˜X(Œ}çàÌ&×‡Ğş	AÙÂŒ”v×Ö½|t:%ÇG9C™ı“®`‰á)_8İ»~KÈñ¾r\Å¢4ãz¥ Î8nV©Ùaİó{€(Õõ¦½²"›¬(ùúÀ²@ç5_üEÍŒ…/=û³¯ï£r’?ä…]tA°Wb8Ç­2†µª¢ÖD”B·Óaú@ˆàói”5Âx¿ı;ˆ®àÒ!³­@‘a³¼%‹Ë"G6ïä%—˜I—˜Ãrñ_ÿ`3òh H‰U.tŸŒŞZ¼½S¼Ù¡#lp84Ü^nK}@A”°¦á}§Jÿcè`X ÑDÈ{ÙÂ„ÌT¤h}3`“>äƒ|¢È+
ÑRW4Õ?Ş³,”oÏíåX"Ë™#*«H‰‹«¢ïïÊ‰Q3ÖÃ¯
;sG²Uç¥š¯W}õºÙ-%% 3ÿf»]U/1z’©k	·Š§–Ê½·4È/
¿pqËÕ-5¹nª²„ª˜Î(›ÜP]ç´;+İ˜d|_!±Ş1MpƒRë¡—Åc ¢[ÌT½uñ4U%€`âÈ_&ãòêQGVèìïe	ş­eX$) <ÒŞ¼ËËå…Q?¥f$€ ´ Pû•rÁŞYw;ì –úÙtCÃ{QÈrº¯ÖÌ*ñò‘§%FNiàÈ¤ÑÇÙá=©#ÙŞC^í`©sèŠ)›G»~÷™Ù›-\òLbŒ¬Ş—×´Nª¬aœ•£Ù´•Í°óJÀw³Œy”#­ğ°—Ï.ÿşŠµÁ”Ù[%V}íë‰Ò™‘g“>»£Üÿ±3»…âŞ£1C?Ã›G¨^Ôè˜ö¥jƒO.»Ï†Ámõ¿ÖÔì#-ßjÈ¾²Q¸]·¸µğo\»ÿ×/Î·Jü5çßxh =œ §Ñî¹şßûê1±@c˜+\¶B»³ñ=6½²cÕîz¾óÿ·î ¬ç‘˜GZ(©´gxL´X £jé¬ÜÁ°llÈÊ¼³³—5©¢“Ô_}aÃ»¾háÔ»/¼ôæÆìş¡M‡µÚ¯ß°9ùÂ“ºç_neoü87î^Ñ²a=’1X™İX÷Ü·¯*°œêåÒku·]6D(ãÓÉìA 6‹++yoZ¾zÖ¾H–¥âuE.Õ÷q#Ş¦PR™YWÆi›×ãª«³tdªJû³4å‘¦ùÛ`¸taK÷ºCŠ<¸ÍêÓ_oåˆüµG7w‡}ú±ı:1¿ƒ›Ş ØõÎ.\óûÍ €íïìÂ¢gß^`ûè‘ú¯<½üÎ‹şøÅ—ıdbğ &é=?[¸ÏåÂ@o‰?0°»s»*Jj,«Z$I¸¤yà¥]Ó$=Ãs, NL	yD¡¤„,›Y3–ò†a€âğr6+)67LÑcV»¥ú‚ºÃoôğZÔW¾séò‡Ö¼uÙ 6›Õ	–ÃŒšN(5(?˜‹æuƒ¼~À~Çã[÷ÿú‹¿şbäöÇÚ(ØzE€  Ï¡Ì·:£ïQ¨ìµ§x^šQ!Y¸Ëæ—SšGê0õ#åE"G S$ÎJ2#Él&K9K¦ÅÁóP0’[ï8Bé¤BşÅï\c1›»¾÷³‹¤–Šçû†Œ©MÌ‰Œ‹n@–‘– 
°Çs>’Œt–¥o½ÿpñ½Ï½ıı›—uEö¼òêƒ–Ù4Ñ4.§âSkR]#8ÒfVnï)K•}f~x(<è·G&Ñáˆš–‰B&~1FQÑhÚc³^Lbe§Ôß©Ï›Î¦2Œª©¢™2ŒŒéaw†{ô®)zü…»?³Ìa³Şø³g(Èüêv.Í,LqÔ0 jÔ0 ³ÀJ†ÍRJa0(4é±7§ö¹ü÷¼|ô¦%Óşû¯8Úv¿7ª÷•‰¸k,TPQİ;ô¦³Ş5›¢·Z©®DµÏ.|S7®^·¯ågèƒó/.»ù¤Wâğ`lA“§µ°d×š½‰Ã@ñº‰®ƒaQÈü¦àA§nfæÇ·ı€gßÚµbûØM°e·"Êœ?¹¿®Öœ(·9A¨NP€‚€R€€!ÒÍN¹Ò¾ö¦Eçİû’øõ‡V¿òŸ·7ÜµõØcÓú"nôP»@÷øF{{½ÉR_ÆÂÛ­HpöÉƒa_šC4 ‚gĞ>Ë§ €[¤§–ªşòPìÒíËÛ§_F8„€!† P_±çõQÙÉiÉÉÕoïkÿì}o_4ÓtË‚gÍllôÍ`ù<‹İL¬ÎKÊ™í–z_¬‡™ÂZ¬Õ1£hdŒ¯b¬NÖê`]rVè¯—:ØÜóş¸9]d•–,¹È‰±îÈ¦xiOÆ»DãÆÁèaÑŸWU^1şéÍ6ºfÿ €BKáÁš'¶ÓòKßØ7üåËjÃr<“³v¯á°ƒeu‹H #+5c¡âºO<ıãöe4ùÖKÄé…(vÛ¾©½p€«}ë»²eu–ŞRa¤ÁÒ½&<¿Ô<UómÃ²ÏÉ¥FOôv÷Ìš‘ÏÏ+|dIåÃŞOßøÀêİÙlê’–´İ9âØ™P€¬ÛB¡X¥|œ<Ô¡ÏœyşÆƒo·UM€ÿi“O ù¥…’ÆÇú	GCCKÇ…˜®¥úƒı[G;KTr¶o^0òZ×89¸k¨¬éÉ;¶–™WØ„È‘±ek}wdl¾Eî]›c3î®x¢=S=Û~°ŞÚÓ™©øê­İsû÷$j-ı7­ª³ômM·suÎ±¨›ÛYçİş…Ë´ç6‰®.©=H"eÔ}¾±§ÃuôXZÕ©Ãb
Åw™Ëšnºã‰­ŠÎ€!GÕç´ğ]ØÙ‘°]]ß´÷U7ôÅöç«+µÏ×ìN¤Wuô™‹Ô8Om‡fÓ1¡¹;4´±oÄ5v›ÿ†B¿ö)÷ÊaÙûÍŠßİßã÷«²qihÿ^õ¨ÈH•æ!;›^ìŞYgé­ûpì«…¦HĞVø²ñ¹ÃeÑ?²cV]a¡-b~ ¾»ßşnÂ×ªÂ/¨{÷‰õ.j¿)õão¦åi'İÂ‚ª :ÈDVç—¨ÑûÎ/t­ÿyãvUŞıªó®{²¥ä ¬™e•7«JÓÎQ2çMô6«§e¥øÏiOyDuN±u^ç_“Ò-‹İ;ö¥ê'YzğDËpÖZú<|bcl¦‹KÎvÜŸ®
¶>XdëÔ³]œuúà‘ùŠ™à™Ò+İµ‘óŒ'fKOMgŞŒª®([Ñ¹êğªÿÕf„(¬	  ÚÄ®°É;
Ï£·Ù‡fÆûŸûy£²Š
Â¨³u÷ö¹›ôÏóƒ=“hÏÔvuPã¿|ôÂÖÉ|‘ec\™9lŸà@ºÎÁf–x¶;¹T­¥ÿ/Éˆ*Âs£+”W(?5µo:÷Ë`¶å{+fW·…/B ÌKößrÁÎ"¶¯³ƒG:]šİ4ÄúK»7ıJn’‘h©€eĞÆÆmLÄ PÉDÅ<Ê‘æP†¤¦SèN›fµ  CÓ¥’BJ	)§@@‡"äÅ½­Ñ$™É¯¡ªìáãŸó¯êÈ”?:øi|(C¥rL¡úÉ|JÆ0óŒv_ıÏ–l¡ºÖd¼–‘ôUûw‰@Ò@Õ@‹)®øÜ¤i?«jüöÑQW@dˆ-WšÅYşõÆ–ç~qõoş}©ÙVøÉöĞ»‘w¶°I(ÔM¨¡[Ä†‘İ"R°örš:K¯ß#}nÎLA;jÉD"|ñÊĞE×úÖ]ç%Fî[†ªëÑ}‚PÂ~ŞÛH ¨œ\j}dNg¶ŒÏÄ\Æ‘˜\÷öAÀC² Æ|FE &:¯æÁ£=Í%a9:-’,4€B’(Øo=ñÙ¢“B-Ÿp½y§…%LÚàù˜Náò8h%º-,,(@ØBP ±¬i$ê ê ²‹K^èŞáäªqr:^Oé’ª«,UZêäÔ d‹=;Põ‡&‰LÉÅƒc€•¨ h 'rtv«ÁI%^	«%‘tî”AL£i×„ó‡<ÔÂ*Ô´¸Á0âÉ9FQˆ¦ÉV! ŠñåºHdEÃ.sĞ–x¶M²ôúLwJ}!	I—9Á&©†Œ¯‰’}¿¾jG¢ÉAGU%-)$W3—{§qò¾Œ1*(îF­Ñ ¦8ÁG²s|hä…Tó1ê0C(@N©d•hºj6@€Òã§b–0fpÏ—˜ã8‹"Æ¿ÆÚ¨N4…cx¦“êÒâ8Ğâ8°'ÙøÓèuœÉ&˜(¨2> §OË›LŠ,	
o"&!hv•¤>h	Ö'†ü¢Ğ¬'Šy´1¬H¨¡ÊŒÉ€è1ÊqTÖ  „ê  f¥¤ És°! (àãw”ÿßIş Îî‘FŠet½´yöÉ |{¢ù@ª6­‹)"°|¡C-ñĞ¡(ÆÓ#õâÀˆY”¨ÎÂd9³dó­ *¿l¡i0ÔH€åNT“ê(Õl’TÂ1tÆ °°ÉÌ*»³lMÖêğOçÒºHO™7†±şèUó½²õ[¯m<ÿàÑq÷¨Å~ÀÌ(o„[U‹+Bklü‘9“(€œ"2®Ó(òDÎd†³ĞX>@òNó‹Â “ 2ˆ˜l|rÜq Cyrlb“’úgsÃ‹LÈ°øÆu-[\c[ú"ğ€ûúnŞ›­ÒñqEVèîö«cæİÿuï#¿ö—¿r÷ÏâÛv@·PşÛU¿õ˜3;”K,föS³6•{ÇCã-¤”B­¶Tœ PxÁ›¶0¿(,'	 „”2òø*$!ÑÍ Lb¯Jb®™*µ¯‹ë³»<ópD¿£ü©é¶#ƒRáHPÛ°½ğµç9]“y3›M.§Ãa³~ç_¿’®Yµ>[-è`~|ìK)ÍÒë™3ì[®=8®Á§Ø`YT£P¢9
YSja~eg–KL#cv¯o~êr àc	0Dñ8ÓŒo/™â–F3’F›ÅØè¡]âF‹¦‚ÒS|h@5Ã]Ì£+R-3¯¶Zİ (¥†A/_²(ÉÖV•¿¶nóc+ğ¬ñó»[œgªÇHQZ*î\nwWC±V>mÑİeãíI&ìŠ$HJÚ÷à®=Îİ·*K?EgM`ı9òË©$	 TJ9^…€R ºÅL9•Ã,0keÉ †”“NN\ØóªH´­ZÑÜ‚li êõõ›ºzşøÒkW-[ÌóüÊUk6[GwïĞhğ¥7Ö­Û´„<øtªÏ¨ªYÜÜ"½në«Hš‹K‹¸ Üv˜L|¼1²,h*'˜e–M^èšı?—êŠ´y·¸"¿(,$Y 	Iu	‚+>Â `C0±™¬!˜ È‘0õÙ «ç›B•€Ğraß²Åu]L¦=ûÛ5Ã(+)š>¥ã¸ÃÇÖnÜ–Û€Í xééıEÅ_[2¹¾ÊKG"BÎÑ5b$WNˆ9(%<¯†cÆ›	y¶YÏÔ’¶0¿(¬dâ „tB-ò—gC  65L<Ñ¢é”~5&¡È‹Å¬¨êæ{4M›Õ<ewÛ¡d:#š…‹ÎŸ`ı–]İ}#Áğğh°½ãØ©7b‚;W(fÎe2q§–¿0ã&é”•7)¢%[[K}}åfñVùÚ<óò‰BBU?£ à¥”"TO;ü €Kft‹`˜x.™RÕl‘u0 ÁĞHèá×ßE üéõW,½`ñ‚9.§Àï}é¼9³*KK\NG8k¬«Y·i[,qZşòW½½u×å—^â§8^|E1QJÌæË Úg›æP–g½aÆó	uÇFQh2¤BVÀºÎ²ŞdHì–ı\:M9Æ0ñ\*•S¸÷`{p,Â0ÌìiM^«¹q’Í*æ¤±ó›'—×UWx\N³`"8B†aÂ±ØÎ½.igÏIÑx\˜+€ãM* )$J.Í7ä…#<‘òÜn³:F%ŒkÏÁøŒÉÏS† º$æ2@Ôœßq|ôóyÜ×^ºÄfµ„#±`yÀÇ2LS}İöİm‡;»+ÅsgMk;tD’å¦úº¦†ZcGBc‘è¼™Óš'O
Æ2ÚÈs ÌĞ4
ÎCc2©VûxlªDÍ@üŒÍpä…:1Iœg@	Æu*é ¥ªÓ®:íLVÊÙBÅå°Z°Œç¡	D³ùÎÛ¿PY Ç‡‚Q¯¿tïÁÎBŸ·º²lqëœK/´ˆ"€ù³¦8ÒqÌ_èu9O›¡µY-qÄ“ 2‹Ûãx (É& |¾åÖ ä[hï$rÀÄpÃÀ¢fÒ5åªÓ®‹f0„QİbÏGXK.N€LVzàÉåÿù?¾¶n#Ã™ê'7úºë‹#­Pe?uÙÒ9PJvusgœ¡¥ ,…¡f Ä£N§;¦ë, Mg5… äåV5y¤… lP»%£Qd;A
ÃÙ€ åy0Šf˜L*‹r=Î‚ƒÂi·•Š ëí/+«JõôoÜ°^S›Ãİ×İUW [A)(a^lœÒ´ê…g8‹1“h§ !,hœC…}üz†1RI›ËÓ5N—Y &’{Ğä…Šš¨¶3 ¨asÏ½2Š¢ºœB0l&]—<PØãÚÂy³]‹ ô	Â€`N$©D¬~ró®­oy=®SÇL³³XR¯×WQpXOî‹’’iü¨µĞ\~ÍS3t6™°P5Ö &œœJÌä…."„ `9–åÇ%„Q5İb&šNY†0„¡4WZa ÆxŸ
‚©íÍVK$RV«øæægıSÊ_2•¦Gx“¨(JRÒLÌÂ8‹4·ğ	°Œ_o6gãq§ªğ tcu
€ÍK[˜_> µ,P7ûyÆ0Œ)£G¨¦§€Á±Œ¢ ”PŠµJ`4Saç¨Ù©²KgÙ¥ø|GÜÅi„†9ÍÌÛmVillï+¿İúGŞQ°ù¢ï©
¯±&IƒOÏ2@±B%Îq’²’9sÆ  ëL®˜ñ…ïBH” *HnÒ —WcÓ :Ëd<€3è,—¹=¡Jå¾«]1ü…èÍç-¸âÿËËIs†x–8Xø,¥ ¢Ñãû=gÒYx^`,7Na>¤ùå‘ÚˆªR ğ™YES™d #+Œ¢jN; Êr„å9†®Š`‘tF×uE=ÃÜ¬$p8ìå~çyú`âÙûFû–JH#}¹x°0Há¸L)+ª*ïp% Pƒ°f€Hô<Ü´$¿´°GaJD€US‰¡úz÷]r™,++ŠÇ€p¼†¥”TO{*ªÙj¦jéDÿ†•/é#‡Úö2ùò-Ÿ©*œ»fÃÖç_]]Rä¿|É¢ö®í{Ú(5XBB¿¸şZís_ ”¥ÇË²5•#Ä(. ë,ëÔ X‰N¨A'´üşÏ‘_‡%—t‘²-şøpà#q¶Ğ«›M “¦¼jZB:K‹#û:^}jXpBSx)¶û¸œŸ?ğ8Ïs7úª–éS4MsãVçBáğ“Ï¬Ì]«­â…4o|$]¤gÅÁèD¡Ç/ Š2¾C”¦q¬U`#Aó,Í–_é!¶2¤ L4Äøü¶t ORBÆë0,b–ğ~’é
O*ô
ç×-¿şŠIe6—bºnp,§ªº®ÓÆÚêë®\6}J= M×ræÇ´ZmW]Ü°´é…†>+-aµ9n×}œªlF„ bü3‡ù¥…2cû^fÚCö½F<F
KLª@³[íG%¦Ô1Šª:ík®g¢ßİFË=·ŸWõä¢†çıÎ¹ëwO_<ozUE@Ve»z^YıÖŠ_3ƒRÊsì»VSSŠÒ’À5‹³Íe¯ŒF„7}~èíî„Å(š5®…&ÓøœS&cÉfDE˜‰ÁSM'ÙÖÓ	ò‹B O`Ş¿(ínFÎæŒI4…c T	‰vk|z£a²o©kıêágÓ½ƒC‘·´[ÔÅ¶m—ÏÈrõ‰TÆa³lÜ¶»»oĞ_èeYNÕ4J©a™L6ßrØ0ŒóæMY8yo¡£§;X³©÷º‡^–×q»3óôÀñjSÑ’µÙS Ù”Éˆ„•²œ,q‰f‚Wf¿ùU;@'ü°Foú^¶×>¼=\@»’–rI47P–¥†Ñç.¾a÷³Şâ¡® ïİÿ\Û5µ¥öÊ‚½zzkßXÁÓ/lÙ´cÇàÈ¨×å.U——T••Øl¶P$šÎd &ó•KëÔ­.õu„?ºaÙ3›˜JmèçÖ¶µu%&·­À• J/€0´»³š¢…;“f‚õª§ƒ”Lp¼£ÀøSJr³³¢u’£JYûZ{´¸P•#ÛwNŞşÛ¢Ám2so‘Kö±“?µUoëªòz¦ø­m•»\î@J-‡ÇFÇÆºzûutí?ÜÑÕÓ—ãÏ_è¿v‰yNÕÅÎ[~ñJã¾˜´øÿ²¯PÖ3"ÁªŒÖk³i¢ BÊàég&ÇÊ<olÈª f1#¨Sò^)~Â˜ø_e¡^}¾ÁôRg³Zx»Ådµğ<äc;^­™Öj/¬ä8Öd2	‚iàĞ¶xçğ@WÏe—=¹w-Y²ËÌ¬K?õÿ}j{CIziİ³•şîîÑš-­6n?5†3cê”†Ëæ8Ú¬ë¼¡/âúÒgæV”¸<—húìÛõêkš½è–¯š]¾x,#+¥“¯¯´úfÆµÌÔ¦©³$“Ş—#*¯¨úºí=oìˆmŒ&˜BŸ]_ùË«ÎúÁ¿r`ÏÎık_mÜ/×ëÊæC“Ê§_õxJfæßòâ’iìõ³7ÖlPKgôÓÏ¿ÚHÆ°,wõ²Æåk6Ş™·rïE¯í”;^ıÇšªÒbu]_»üâú™S[z»hd¬gß–’†Ùşâ3ŒŸ¯­Ûyİ7V¥Õÿ¯WùêÿñµmÖ±Ä«°80iÆœcü}ÃE©¶7Le–¤LÕG»C/mí¥K'UÖ”:ÛDúÖßL  ªIDATNiyS<SÀ0ìz¦¿ê²é‡#×ßûêÌmG Â.™a©¯«:!–a˜šæ¹ş@ù»n'Š–âªz›İ~ÆÆPC¿E›A'26›`
U-ñ`şÌÚrñ"‘H0´ÚlÁ®AÃİr5GXkİ”KŸx~çşn@,MÖ·‰àæÔv7•í³[¹ÚRùü¦íÑ”ûå_ºçÏPl<ÚóÙ²¶6å&sˆF£===ccc±X¬  àÌ8÷şvİ†=‘÷¿îãÄÄ¿ùà¿İºô]g„,Ëååå‡chhˆÎ»:n½qÒ…6 ‚ $$ó‰Ò¦¬ÊÿöMc$~ë•Sß˜]û‰#Û7­>zå³›NK¬ÄeËĞĞ¢('¸İîÆÆÆ‘‘‘`ğmı«ªê^;üáöcÀÄS¸¯3sàp·Ç!¤ÓiY–W¬:È›Ì,–!ÇB@@¨!ñúE‰Dbhh¨¶¶¶¤ä4Ët 3têG
æåèYöC_ƒÀÉ¬Ÿ´§ïšÁØ{x´ªªêÔ#¡P¨½½İëõúıE¿xp%OA4M§ ªªÿ¯Ë7_3‹âp8õé¹=Ø`€½ç¡×üÉçKKK|é?×mo?CÅôU­w}Å€RÚÕÕ¥i€ŠŠ
Qƒ¡±¾Qx·Oq¨·ı2À³§ÏpßöîD2™´Ûí±Xlxx€ÏçkllÌ}cëğ›ïœá—M®XPĞĞĞ  ß÷ØZ:ÑüaÂmaİ¡¯Ş8aHOO«EÖìŠ¾+yK ?ş_ËÊ> „Çãõz½^ïğğğğğğöwnŞÓŸ’ÈŸ§|eÉªg¢9ÈõÅ*ÏÇUUUù|>‹å¤Wåwó¿_uôİf(ßº¹Úa5Y­ÖP8şµŸ¬¥Ìoı„|ĞB IÕQºè¦Uó[^øîõ×X~øØC)E<õ§¨¸ÏÖjkk[¸paÿ¦Kö<úÆ¦£¯o:¶­m4£ÛÎ8¾qH×•ŠÎ­¼h~åó›vîÜ±|ùr†a~øÃ¾ëJ¯K95«–õ»Œ«.]d³Y›.şA_Ø¤³¿)&<.<,Q‚””Xgˆ1fõ;æİö¹‹Nu|¾ÿıï×ÖÖÖÖÖnŞ¼¹µµµ¼¼Üï÷'‰Áá`(œ¤U•ê†.ğlKô¹-%Å¾şÚÚÚ—^zi÷îİ·ß~ûOúÓ‹/¾øæ›o>!SUÕûı»¿Ù“ÕÎ‚1‘´M0¢’HóãíG^M6é”Hö3ò !ñ·ÿ÷®…×ß÷öÖ“?Ó××·hÑ¢455­^½º¸¸øÎ;ï<|ø0õO+ŸŠZv~C|¸íÆ¸ >Ö3ĞŒç¹ßüæ7kÖ¬ñûıv»]’$Q_xá…Hd<0x}í–kï»óWÎÈ …Z#’=øC^Qø@¶¶+Üö§%7ırÕ›ÛeY)--]»vm?Ã0©Tª»»Ûb±´¶¶644tww———{<ƒØ²eËÊ•+	!”Òòòò={ö””””——Ïš5ëá‡¶Ûí+_Ù¼àÓ÷^öõ5ûºó±Xô=GoÓ·nOfİµU…«o¼|Æ”æZ§Ó	 ™Lú|>çÓé´agáÂ…Ã†Fïºë®Õ«WoİºUUÕiÓ¦%	¿ßïõzgÌn½çÑõËWˆæÔîìz§¼²…ôR¶dnåÜæ’ÙMÅ4cëëëşóŸ;Î[n¹åG?úQCCÃ”)S2™LkkëĞĞP(œÚy`hë¾ÁuÛ{G=i;g=…§ƒòH»¬¤2à*ôX81q,U5CUõÑpºg0ÏBC~ÍÙş8ûÒ÷Qa¥:ªş…µdWäåpv!ç€sşà…g=ÎQxÖã…g=ÎQxÖã…g=şW[	*3J³    IEND®B`‚                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            2"><a class="reference internal" href="path_helper.html">Path Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="security_helper.html">Security Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="smiley_helper.html">Smiley Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="string_helper.html">String Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="text_helper.html">Text Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="typography_helper.html">Typography Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="url_helper.html">URL Helper</a></li>
<li class="toctree-l2"><a class="reference internal" href="xml_helper.html">XML Helper</a></li>
</ul>
</li>
</ul>

          
        
      </div>
      &nbsp;
    </nav>

    <section data-toggle="wy-nav-shift" class="wy-nav-content-wrap">

      
      <nav class="wy-nav-top" role="navigation" aria-label="top navigation">
        <i data-toggle="wy-nav-top" class="fa fa-bars"></i>
        <a href="../index.html">CodeIgniter</a>
      </nav>


      
      <div class="wy-nav-content">
        <div class="rst-content">
          <div role="navigation" aria-label="breadcrumbs navigation">
  <ul class="wy-breadcrumbs">
    <li><a href="../index.html">Docs</a> &raquo;</li>
      
        <li><a href="index.html">Helpers</a> &raquo;</li>
      
    <li>HTML Helper</li>
    <li class="wy-breadcrumbs-aside">
      
    </li>
    <div style="float:right;margin-left:5px;" id="closeMe">
      <img title="Classic Layout" alt="classic layout" src="data:image/gif;base64,R0lGODlhFAAUAJEAAAAAADMzM////wAAACH5BAUUAAIALAAAAAAUABQAAAImlI+py+0PU5gRBRDM3DxbWoXis42X13USOLauUIqnlsaH/eY6UwAAOw==" />
    </div>
  </ul>
  <hr/>
</div>
          <div role="main" class="document">
            
  <div class="section" id="html-helper">
<h1>HTML Helper<a class="headerlink" href="#html-helper" title="Permalink to this headline">Â¶</a></h1>
<p>The HTML Helper file ‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ  ^IDATxœí›yxeÇ¿uö•>rwÎ&	!			Æpa¸V\Ga×åÁcœa”qÇg|fİyÆuœyf]E×ûqtw˜˜QTtÄá†rŸt’N§ïîê®®ªwÿ Ê5¸Oa}şê®®_UÿêSoÕï}ß*Šª}j†şÿş_M¡êÑªM¡êaÇy{D†" (4Pã¼³…ŠdI8k“®Mñ[»1ad‰¤Àgœa¾1`İëImó$>EÓy%K¡"ÕòYuB¥Â¡Ä¹¨+¡Ë g:gEZ
OÓ¸·¬gq!mÒÑPÍPúƒ½«™šË @ ÛÛòN»q}OAUš;w‚Û yS!hŞ^lkt	†ÊMùåÀPyÎYÄ†»u	Ï+óú÷ö!à×”n]SÛÇv
I!:ut%%QÍ~±zÿ¿ÎŒäYÈ‡|Q	òÚ½9Í?ş[OÃ”—ÌğEå‡ŞvVç–•Ğ+K=%tSÛpÂCÒ@Ñ @Ètvÿª¬OşgI89ŞşÉHî’”Æ•Å®íÖ ¬?ÿ¤Ñ8Ÿ1ÊÉ\XšÉuÙ!ë¿*vßYIyf¶ƒİtıQ‡r€9Ñ÷…ïxSoq
^Ø5•Nø)ÀÈÓı~ñÔF†ÃÒ©{ÚCGû£;[CMƒÂ}ï™–%ïº¹ãÉ¢÷R ù_÷Ö§#™¥(¬ª!~¼u¸ĞªgÒ,2¾±£ jÆ®H«“}Ûÿ^Zÿƒrt{¥G¶„fL0å'³k¯k˜I¶ï¸¾î®© €šƒï7Ò“¸‡e½sÌg30NBH( 8zô¸½%ÈPÔ’rën'\D«;vk©\·ôàíúOÕ:M<]ã0=¸)2”V]+ß?áÈ¶n®ÜøæÊ[á†ÃŠRï?OI¼v?øĞ¾z¶ÉÈÓÁÄ_Øø¢Tî§¯wÿf³kÅŒÔiÓÖ¦@M¾Ñ’,¦:Ïèäç¾Ÿ_•k<µ)¥,z€+˜ ÅéºŸ¿Ù{ïúî3ûüRj$,ì¤'±÷L3üÃ{¹=¦¬®‰•Y[û¬ßÜ1P9ÔØc¤DÑ	}4¥H¬eÃŒsÌŞî°‘£ÓtÏïrß\e;Ôıcû®Úô%“­Oí\sK …àÄ@¬~Èèë,l¢Ô©Éem@(.ÿêİ¾åÕ)ù>ë?0/sj®±Õ»¥*y$"rFjòM;{ØŸ4.¦â~…ÖÃöõrNEÇù æPÛ)IØÙ¦Ôä›,zfoWøƒ=‘?şÈñân÷[G|Ë¦ØÖÜ’K(ëèW;‹Ú•b°£íDáöÌ²9oŸà¼©„~q¹# ÈëŒ¤éL²Üørk¶•›˜®«Ê1ŞPf=âŒ¦qB¡ÜĞaªı¦r¿J¸@+üœ©ÔM7ö¸Ó×ÛÇ>pííWd–M±MÎ2¤™Ø·NÊ7–÷³¥£E&@QÔŠ¥•k7!rV¢õşâ¦•UŠ¤À’şmSßŞÎÈÃ‹ì÷ÍNÿbËQ™÷~y'U6şY^ÕŒÑ©8“AdŸèê_Zã˜Ñò¤¶À´»-t÷¬ôÚÂ¤N¯¼òãÜWç‡X;¨Ó}¸šÒ¬§V/ziãÁÑïfÒ?ö—¼y’äqÃ3ò¸¼dg¨_^oÿ"HRÈªí¶}Òt­/øe¹è)Q²Í+ÊŸv„}ÑÑN‚¥ÿtgAQºî‘İúE»ÖËµ`øsânš3©Ô‘:­,û¬¥İËVÜİ¸ì¶Í6#ÿ»e9gúÛÑœŸå·Ä{Ç)¯oc·B&><ÛØøËÂú5s†ËÒ›yh;[`MØÍÌHDzõ(÷ã}•{Äé
3v×û™oÈL1	qiË¾s£Ùn9]{z,0X)ñ,‰+Øı~•iz.sGÓë
ÆF¤¤óÏ1ã^È½fî6ñ”;”È4s;]–—º*||/z&òıí±QŸuæåNÇ17Ï-M2p<Çp,c1ñİ;†¼‘_<û!£«uøëOôŸŞ!YRë­¹];íM˜â›*m—/7	~0L-ß;7¦?»kŒÅ©D¸„LŠÒôp¢7Hı¾÷ğº…¶ı¡¬“r:ôç®OÈNwà¯Ş\e;syfŠiıcß;õùí'~úä‡g…QÔ WòÂP	(êı	%ouËÄ5â†t=1ğL MHâ8æy3Æ…”pæcƒ0‹=o|¹­ÈEò@‡Ÿ|ò	m÷:ZúBºÎ˜íœçPpİ–†¢œäÉéçüÄŞúëWv	qéüİÿÂqä'­wvzşxØB'"³³…¦áÕîIN®ró¼Šû^8’0º†½¯y—öÃŠ‚şpnN§^'¼?|—;Àœ"Ä¥·w6‹’¼ ¦à‹…Ş 0wÕ_>ÜÛN0”oHn®²»¬Fq·äló¦¶'¦np:¼#C{¥™`tã˜çUÌºö¬¡Ï°Ü¯‹Ê„z¢«ò9±	TıÙKa=ˆRÉ9A
!‘XâÌ%f£nØkú# –Îğ¬û_‡‘E,9•Î¼¿è`'c»{áRà
šk(Ö{VŞ³º¼k²>.+8¦½‹ÌvÈùxÿù=¸Ûæ—„ãÏü½>9–¾uş¹]u’-´’ŒÊ](İ†n³w®ÒûDÕQpIZ¼|.Ò/õ´ Ä¥7»(‘Äá×!7ˆÂôRhûn¥!´kşöT6rf@n†yfEîc½5+_{èùm×İ·¶©ÛóÃEåÔÙª&;·\÷/æãx5dU-`DDõ‘8µ§7ldeš³ájŒÍ…GgÍ¾Ô}räiFtóİğ&#×«l3©ôGŠ&éÈåò'Á¯¯8pÒuß›=€ÛY¿µavUŞá–A(öÅj©¬ğOîÆ_?R7¶A‘@±ğ3Ç­CuI¡îAıqCÂ@kˆ—Å…ÊfÙÜİ˜äDèICúâÆ)ÛUM¥é2ªn(¹_4ÑÑïÛv SQN×.qQ~÷“ÄÄÓåèÒ´Şò†«ÒBsmíïÚ~Pƒ¹(í
šèCCùˆk#m—ÉEÆH9]¨ào¿1s©¾´x¨°Ïçƒgê`Ñáµ¡è_Âñæ.j¯¿4AŒ¥æ`PâdBééAL”hŠÜß="êB'ç‘hÇ¯èøŸAÁ˜À‰EˆÆnÔåß¥?n×›s°æïò¹Ø07L<7MgfÄ“1üNÌCe:m-7è¼e¾M¡ê1e„wgï	íuşÄØCb:Z6±òK5õóÒ‡ö¤·F&4úË£®|ßA"F%çˆEŠ­¯ğÌË…AÁ‹ÍÎ¸öÈÅ—àâ
)ŠJ]^"¯÷…Ü¬³è_êşYqŸ 0‚vš"/V×gèc5É^™P?rtœ ³	…V@Iµ² ãwS9SO4©ÒêOÕÅw¹í ÷ß‡¨êYa’¢{¬Bi„+óKëzkå¼ s‰É&W<uSĞÿºÒÛ’Í,s_jEÈ¶›3bôˆ¿¤ueæà¶¡¬^¬²ù6ä®™zhZªg’9ôrM}sĞÊÑJ¾):?cèÑÆª˜Ì<×V`ŠiXOÄ‰Ÿ#•Ôêù7$ñ6şçÈ;-óIır\ê|¶Yyûí‘Â…¢Z’	ËÑ¶ào§·/Ïé$÷g>xtÚ³­es3†ê<é½QSLfjS=uŒá˜şGçÛ}ùNìŠ˜D…^×S PÖTZ]ÑmÒƒ¦)(”5AæˆìMpäN¬ä+ŸõUÅ%æ.dùçSÌ”5r§_YÛ›R¦xïÎOr¤C’¨]Á ØNHÅ=€åŸ}gAÆ`PäœQ“‘‘N­FF	ÃÓdEıu>QwºNÕÕ×®ÍŠ ÿr‚9¡×ÿ6UºcR¼!`ú(åŠf|Õq	…5V¿YÇ†ãr£,‘	®'ÛJ®á¢­Â³#¡ú	^™øùŠ¤W`×vxøX5C™P‹w_’8 Q™ÀçcfIä}W—ŸnÑméIÙ¨¸‰M8 UÔ±³—dóÏhŒÉ%~æ·×÷u¸âtJˆ]œå_˜zìä5ÇÃiÁ´:”t‚œºK ¢°ìC`ñ©(™P Nù (0„Ğ€(&h“o=P‘.N˜asÿ<cä0EÌv'Ç>H‘W*×«”K(ì‹›—œ/vóŒ­×dZI†8/{ÿŒíßÅpr:ÀÄA°`x”ö` Ä 0gÌcÈ C+Š]8Ş%J
èúMb¤|¢màåYÇiP4“üô`ÆÜ]¥a…“ñ~Ùêjç) !™èw¸³¦›²-K“6Ÿ¾ÑØ…t.dG EûacĞŸ†¼O¡Äÿ¼ªÌÙ*
³¹~ÈN©(ÙkQf ù¬¡éY!Š¦^oJ}²kªG¦„>Kãâ\Î+¢4;úEÃ–¡l K=0©	!ŸÍEÄŒLë\èIF"¬.~:Ô$€‹À3^À5!Ã•cÅYLìÉN D!vN‘	t»µWV¿—n…€|Ù;û:Î¸Š¼.lŒ ÀyáÓ!Æ y >ĞÑÂ!–3jj†7DŞnb|_EÔ~t’.ì‘•M.ém?+e~ŠÀ,(–+œïUÈ%>ß…”n(,‚éH‘¿ôòy4LÄH5lGa€=ˆÆB+„kG£’6Ã¨G²r®JD+Pğ¿ÈôÀMCÌÂÀdXİHòAbáÉ~åò¼Š¹ìÚA,Àà©'*ÒŞFß4è½H:‰mè#ˆ*à
ºàNdƒdãçG¡ EFSŒm`bÈóaÄˆÁj(=ğÎ‡÷Š%÷íà²[á™Ø·£¸!
’‰GXÓ0t4"VDsÀ:‘FT‚‘EÀÊ£H NƒXa@¶€!Hq¨Ñò+Ô·‹Ë¹GÄA@8}Õ ¹C°ñh«„{líàtÏÂğ-° fAÏl$`O Î£«Ñ02\¹\£Õ/_Ÿ¯Ô	#F¸ç €!h,-cò{è®F¨zt¶/:eH­CùtU€’‘„'Ï\h/€_éBz” ËQØ»Ğ±pì’D×ÂOĞ:ŠD{qpœùú
O¸‹öÊe€Öæâ¯ã5šuÉIZmÌåJ¡UªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªGS¨z4…ªçÿ ‹sß+aõQ    IEND®B`‚                                                                                                                                                                                                                                                                                                                                                    lsPIhA4aRnnHJTLptIS6CNsY7iASpxUUMkReGpfbQW0vtN5pitvrsN28rwtBD0nc0+/Yft5XhaB6TuaXfsP28rwtA9J3NPv2H7eV4Wgek7mn37D9vK8LQPSdzT79h+3leFoHpO5pd+w/byvC0D0nc0u/Yft5XhaB6TuaXfsP28rwtA9J3NLv2H7eV4Wgek7ml37D9vK8LQPSdzS79h+3leFoHpO5p9+w/byvC0E9r7Reazy2HIYVPxkS/CUHVn26cosxyv2g7h89LYmZSXOenvLEQ1YaQ222RATcQCP8rSGqqA8S02W2pQ6FhMoAIlqCtsnwoCpdKClejI4i3Sgtb+GBxVuNBSFt1pV/RQefLjPyUDy4z8lA8uM/JQPLjPyUDy4z8lA8uM/JQPLjPyUDy4z8lA8uM/JQPLjPyUDy4z8lA8utJ/koJ7WCbBU/LQXOPAFq1koK8B0pag90CggtBBf6qB0UDooHRQOigdFA6KB0UDooHRQOigdFA6KB0UDooI0EaBQf//Z" title="Toggle Table of Contents" alt="Toggle Table of Contents" />
  </a>
</div>

  <div class="wy-grid-for-nav">

    
    <nav data-toggle="wy-nav-shift" class="wy-nav-side">
      <div class="wy-side-nav-search">
        
          <a href="../index.html" class="fa fa-home"> CodeIgniter</a>
        
        
<div role="search">
  <form id="rtd-search-form" class="wy-form" action="../search.html" method="get">
    <input type="text" name="q" placeholder="Search docs" />
    <input type="hidden" name="check_keywords" value="yes" />
    <input type="hidden" name="area" value="default" />
  </form>
</div>
      </div>

      <div class="wy-menu wy-menu-vertical" data-spy="affix" role="navigation" aria-label="main navigation">
        
          
          
              <ul>
<li class="toctree-l1"><a class="reference internal" href="../general/welcome.html">Welcome to CodeIgniter</a></li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../installation/index.html">Installation Instructions</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../installation/downloads.html">Downloading CodeIgniter</a></li>
<li class="toctree-l2"><a class="reference internal" href="../installation/index.html">Installation Instructions</a></li>
<li class="toctree-l2"><a class="reference internal" href="../installation/upgrading.html">Upgrading From a Previous Version</a></li>
<li class="toctree-l2"><a class="reference internal" href="../installation/troubleshooting.html">Troubleshooting</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../overview/index.html">CodeIgniter Overview</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../overview/getting_started.html">Getting Started</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/at_a_glance.html">CodeIgniter at a Glance</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/features.html">Supported Features</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/appflow.html">Application Flow Chart</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/mvc.html">Model-View-Controller</a></li>
<li class="toctree-l2"><a class="reference internal" href="../overview/goals.html">Architectural Goals</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../tutorial/index.html">Tutorial</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/static_pages.html">Static pages</a></li>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/news_section.html">News section</a></li>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/create_news_items.html">Create news items</a></li>
<li class="toctree-l2"><a class="reference internal" href="../tutorial/conclusion.html">Conclusion</a></li>
</ul>
</li>
</ul>
<ul>
<li class="toctree-l1"><a class="reference internal" href="../contributing/index.html">Contrib‰PNG

   IHDR   –   d   ë9^§   	pHYs     šœ  lIDATxœíwx\Õ™ğßsn™Şû¨,Y–eI–åml¦cH„MHR7»I¾/ù²›oI64Ø%°	„!XÀ4wŒ.’­ni4*3£éåöröÓ“oq6Ëj†O¿¿ô<º÷<ç¼¿çÜûv‘[ajÏvæøk™SXõÌ)¬zæV=s
«9…UÏœÂªgNaÕ3§°ê™SXõÌ)¬zæV=s
«9…UÏœÂªgNaÕ3§°ê™SXõ|˜Š²/)³]‹œ³Â_Ü?qË­ƒ’¢€(ë³]
z¶+ğAÑ-k<ÕhñÜüıˆ’ş³o´cŒf»^ÿıPß»¡e¶ëğ—q"ª>{2dcóô}¾|ÇNzwŸä4(>;up@ªóÓ Ğ{ªôóßMÎ·{÷%Ö7Õîê82˜/¯èp› 7fó¥íGÅ{_EÏdÒ9¾5LİóŠğüI¼jPT5™FU´	QÕÆèÁcİ=QéØäx_•5j:úÉÅù×”õ…‰c‰ÿoVN ÀŞ£¹»•““Å­A
£‡9L¦éB^ÃÊÿ²–¡Ñ#û©Ï<È`ÆÜ¢²!Ê,j“Ô†í­>åãÙU­¦Ùnë_@5=HŸ>ÄşdlnxÙÁàS?º`t£÷ÀöØ‚Å¡ÌÍ×|ì¢¯Æ®ì ŸŞ•:Jê\Ö:§õôW¯Z@€Ü¿¿\–¤‘X0şù.Ç•›Ö,1î‹X'œ¸ğö¾ßö4‹Zv[{éñçªViv[úQ5
óe%`ÉW×¿6¶êÏAkêø§·	}ı-Ë½ÅÑá‘Ş=§âåã1N”'u.Ã;ïE %õÁ£“cû{²úĞëSæüRwĞ{¶râëÿØĞEùªE}ë~ÓöÉ‡”º† 'XLU™ê¨èÎÔáXàdlL*æ4«é¹¡nı@ö„Y|å»Lvâü¡;ˆdòÂŞlgĞ'*šÃJ‡kédR™I+>»ÉÄPª¦Ê
é)®éö)fÿğîàîó9C:eıÃ«|ÄApqjÌÑçşSp‹tëêÆK»3³İô÷§rEN›æ`W¯¢Ö}ş¬õ_Ø¦?ğÑIJWC ìas6oW6]¿wó-/µt,†İøï>I¨¹æEÔG¯±­^kÍçÃ.‹‰¡ €“Õ²¤©šî²ÑF¬|áĞÆ/Ü¶=–o¾ìÚo~÷<Áá ³Ö6 ú²@îõ¯Íl^Yzş÷Jœ:Ûax*4#UTòøÇË¿ç=ç›[ëÙdš_}ş†~§MKìIÖœe:úË«µU5Ùuüã}XW¿Ø=±¢ÅöÎ]ãi™gJ”{Ì4Ù<z#½LdyE°X˜ó×Ÿ;8,wúĞ–ÍXqb×«¯}ù<æ'ÿ.y†İŸv[‘XóeQ(ÖâW+R¡
OMğ¾‡õi—ºä*…ÑÈxJJî?±ÿ> Ğ•İÒ£Ç-'“FƒŒCË¿±héÖáñÔÆvw×Öì+49'0B‚¤ıâîD“İõÎğ'‹üd¾pÇwº½.v|BvZß½X«5†Èî»Dv¼>yPêzhÛğ’:M'ğÀ^e•ùA§•šµœ1ªğÙí3Ë{LÅj¡°±1 ,IìZkemC¤øÛ¾ÈhBq©æ£Çû[ı3²ÕqÂjÂ ğÔÎ”]²Sïè@šNÒ%W¹²D&K`é×—ãÍîøİÏ$Œ©ÿ<Ôu(úúšÄÙÁÉTVfÜî…½L¥w@ ¨Ìw!!`İ¡+@m^şÃíkI%íÒ_õŞôpæÖÇµÍ·÷
ùG¯NP¾gÅÒôÁÍÛ¾3Î·79'¼7:M6­ÏêşrıY¿ze`Ìé/³;&Æµ~Ó’fC'ù…K?±}æúË?w· !èÓ‹ãW6_{ÿÀ­Ïçÿ÷#Ù¿ùm_UøƒÊÌHuBØ˜~Gm[Á×uãøo0ö<zpf‚Ö;|-6oÈ:•ú?{&vÉsù+‡^Îµmz°³ÕrO[ˆŒ*6“.©Ñ’íÆkşáÕÜ#‡NîøÚy›êJæé×İrÇ3Û¬~Gl÷ít`Ø@Ï÷b¿´êûî__eøüS
oê\¾V”Õ?ö<ÑsªÔÙd›í`¼?•¨!ôxİ|eÑúåû~ÔşÓÁÓŠÊªìE+—ÌkæùÂ³Ñ¤®“ï_eÿ­?öìåcÍÈÍƒqgOO—X£¯æ3±"5#]Eç‘›ï‘)Ed‡Sß}æön^·\ı‡ÖdZ ™ÚP›şêG¤«º§]V!0©+–®ûä¶õÙ\©':ä²WÁ‹*óAŠ ´ÆÀ¦ƒw2Û¯Æ  ku…šyõA h
‡Ö€c4/HÆ…Ş	-ä3B1ñ©…£G¾‘itÃ“Wô2Êh‹Š{ŸMÍ”‹qiàXnhwFs6.¢¶e¬³zâS©ß:éÛ”â5ÊlÀ Ğ´4†Ke ¸ã´°³ˆ3£""øÎÖ‹j;<¢B `Y“­%„G§©Üñ¾èEk} 0–
Û¶-C(ÛÖ8vmg¾§xö/%¶´Í@|n&MT  MEËi	 .ïV¸>ÊÚ—>pÅpCyÀX~âu_¶¨ @ÀI'f
c³É`dˆÍüvpú£eB@”´G³Å
,V¢B hé°î1ßøÙëB /k,ƒ,fMQ^3™# `·Ğ-ó‚ßÒ<"×»H+±‹#íçÅ„=e§Z°ÒmŒI@(@&t± 0<©„–~«®uc³GÏûæeçŞÂI xëB*SHgR• ÀÑhé«w^ÿ³şK~Ò{Ş]u[ß‡S³›÷R¡ƒŠá	Ş·à
Máƒ¦Ø‰QîÎ'r{İ•—lh¬¶Ìßõğ¡©”pV»9LİºDûáó†×òMù<÷óG_}nÌqÎ¦Mù½B-­M©®".ˆÉÇ¬=/´¤İ‹K÷6ŠR5äØ=/Åû¸ğ/H×ª/„ÜÔëƒåŸ>Î]såùË»„D™ÛyrI3{÷¡d|°¢—6æ`oª”ŸÔR3Ò§.Ïv„Ş¦Ó MÛ›Âø{ŸüÎuÖá×lñk¾y“‘ ŒÈ×–íŸ˜¿¸=ÀPÈî°¤sâbÈ‡g¶| `i‹¹±¬pŸº­†Õey¹xªPëb¶ó—5E†´/ó«£Rîv»­Kje§•Ùw$ÿêmÂu¬¹Şç9]F«{€ûÑ‰ì¡ wN”>Z#¢õæíµ÷ı2ò˜g56ï¥B{ádÁ-ŸÏå’c["%3‹ÅBòÔxÒlyşÇéÄÔ(W!Œ‘‰ŸTYçÏ×Ş9â.ä”/|¤Ä	êÁbBÒÃKWÜãÌX±»Én§ÓæÑ§_-­ª+6º¤ÏvM=_W5Ò÷­Ôü¨)ëâ3=…&wl_?ûíghN^9eL–dã·üç_ÛpÖr_Ğezê3w~s~­ßğşmøŸ¢B{!¢˜`Ğ€&NM÷éúŠFŠ¡¡0¹óøı‡±¼¤êĞı4‹‰j¨±ımc¬£Ö±½Y(g2w=_ÌaÔ±Ä»Ìg”eİï7šLôü5ÁÛv$"æÔŠ&Ûw/CVÕpQi è.-Êi
¥uu:•qŞx?­‘	¢5`#ƒĞ%IûL¦‘$é‚ êšìqTVĞ*«6oAS©ÚNœ‘4 A;²¨WúK[3ÁTê\0<]nmr\Úuzk“>ë½í«W\‘$M4]' ÍJ4[;<Ù¬´î‹¯õŞ·Öã8½³M€Ò¸Rèã*·˜¶4P†•³cf>eÒ†5ÁôÉ”h³ÙT•Ä¢|MÀ1§škg-2J…f¤”^B¼^{¢HÆÒol>³ĞE]Ìé‰O@aPùò{n¼ı+måXi"Zr8X³™B0F„‡ƒ•eíÉ?D7v¹İöwøÈ´¦Ñ¡è¤-5˜ À ²#JUt]'4Ö4›ïû_‘ÍË+k¼X¡½ÕgxAª	º^—Éd¿2ßñÊV4x¾Í÷“£G36›³6“Ùˆ6XÊ7]ãwYóC3‚Š‘Ëe`Y\*‘h´¤åkÖÔ¸|/öh=ÇBÉiQiŒÆqíà áÏÌ‰Nè’‘Â‹™ap¹¤t9™@£å.
gF…*\Ül:xìu‹Ñ¨hm´9° @Nÿ‹ 0˜t\i[¼|ãÕŸïÛ¹ïĞ@\m‰ø1¶NÆÜX§ÎZìIÍíEÑ	=õg2ELY–ûZ%‰2šÌV#ní÷õN=Ö¯ñûmåZ5 ·KÇ	g¼Ù2úˆ
›5¸JR ¡âüAÅ*¤0îİ1oáÆT‰ä²¼Â¨‡5TˆÉ€Jq˜‘ÁfW´Ü/Mÿ½7Ø1ŞöD*¬17ceMŒÉ{k¯¬š"ô^âEñ8‰0åézg£Çi}a—6Î—±ŞánLæW¶{ÑÆ6æ©^¾õìã5B0ˆ˜¢åK?¾mfj=†ã/%nÚœí¨üy*wâ«ÇRû&2Šß†?·Õ	ĞDŒ”D2”¦ÆóWäòÕMvì×[bÎ¤XšK©/ ]mÒcW7D¥İûw¦ÚGQúâf  € €ø·©ÃFBˆ-H-¸¸ëÔİäÿšÎ @[“SÕt#BN$*$×‹™Ìé:d‘¸j!Ï·…©’l<Á;ÏĞŸwúh ÑãN¨ï}éÚ)ªa¬è#¦WåÖjv`ˆ”Ğe
ĞÀıEY…µ¶-¬û Ûû_¦r:mL;úd¦HhŒ
‰euN" ^&]õcp ÁsjÎhŞ™ò"fK¶`öÆ:¯"Œ±^oëÊ1FÂ˜ ™è ¡Ë  !F,ÚÛæ·µÉ´±•« ¾~Ã’õ‹Ì,†²4…Š E¿$õ]ƒÚêîÀÙÁ)9¶8µîğ]‘S/›ÓÃ i!Ç§ i*]N [˜œu*¢[ètùËİ¥ÕÍù²Èä\)OÔ,QTBÜˆNêr4 ª%#ÇŒ<2K1x*49¬èŠ(ÓFg¤sZ©=C*¯’‡£Ú²¥ê°ôìÎî…®ñb±Æ Î$êï³5c#´\©¬X<`°#]-›½‚Ñ©É\A,¤#kOTq¹?åw±Y·FsoŒ(DĞóºªiDFA×3Sâ9-MScÇ[œ³…÷£¢bŒ\6ÚkÓ¿™AÓaeÅÒèŞ½òÖNº«Ú;¬&3" hâL½Ç4E<Ú	 ¬+µ\œ
(”ÅZat#Cxú€‘2Áš~³pJÈÌÒ °ü·ı.¢¡Ù5ª‹y¢.¦-*6§×uFôâ°Î^ŞŠVÈ28°Ñã@c(*ğrŸâ² š‚XV_TCM{ì  €ˆşæñAMYoqX`Juwõ4òX„8g^Ä+Ê¨¥ë­Â‰¦ÚÌ4 4XŒ"p'Uc:«+4BÑÇ4Q˜T	m$MvşÜÀ¿B¨h…‚¤ì+}Óº¤’t‰¬h¤·ÜÉüîZ)ìÄ{†T— €ÑœÊÉ
 t9> bŒMÉAšX1RJàÁ¬®Q:P¬'Ñ“	vZòœÁ›‰Á"H´‹W\ÂjZÉ]ÄbİÈúRJâ9‹"m[µ.¥ÇÔçŒ2ŞY¡¢"„,F4',ñàú´Zg\cRÅ•ó¨aàõS8G{Oß¢:êãÿïı#/©Ö@8ºG¦œsÙŞ1ó§Ö£Ç(¹ê%]L³+6ouÌhÛ+jG÷{djû½u.ä©Ü—aEg¤F/msŸ³Îs¤ÁƒS%òoK5WãcñEŠF“°¨É6:%L€1 âŞ}Š…¼ëp6“Ï;‘ÂO7¬I×.@#ZÍÉœÒ ” é3æšO6®Ú>¨¼vï¿]ÑQªè^ Ó¼±ÉOÍè>Ú1í{AÙ †Ôcqß»_ûõnÙÖ.ôÅ]'KÀà9µcKâ`Òä™±†sÖ€¢ˆÌŠZVtÆ¤ÚCŒX  EO3¼9z8ÃÙpÀ“( @æ€µ€&Ñbì8ÿ§‡ï^ÛjŸÍ¼•®ĞdÀü›½rÈcüæÄ' °æ‚±î_x—ÖÏÔù²+0@fŞ†‡üm¦rÒÎg¹Q³Xˆ`š‰2I“d°£=j5o~«pÅx¹/zëå´áÅœ$b°úA,‚=‚ úÚ7|¦g1ïK¥+<ÒŸcƒÚG_Õs}Ñ\¥!09A~0tö¯:Ÿ$½'í ƒ  !bğ¶ É 6~Ô¼0äF3Ææ³ÎØ~Õ–íïŞ¶„Ğ„ì•äh—ağ€Ğ2¬  œÆ…iğ4rÖ:B¦Qå&¤¯pYÎ
g²!Ò  ğ s`qó¬ï»}g¯Ú)±àß¾ŞZ9ß–41T+ycÌ8A…<6hª½6[â·ß»Ú °®ƒıÅ##hñ@.®z :è*¤GÁ™çgº ûœ•µÌûN*]á±‚÷›£×èÔN  ¢ƒÙŒh#@¾LÕøBYWº_¶Ô>®×D@•Ó +€( *”Á˜=%º›˜â´btkæUäsÛP°2£`vƒ&C¢¬~°xp<cì«Ü„´âæØİâÚšRX9ğúAæ8•–™¡ß}ò6’7ÿøÓÒüã»“Ë1¶J6œ 4…Ê¼,ƒÚ%`rB)	0è˜]À¥!£Ä¬»zß¦Ò¦%3 €Å|dˆøt·C:fÍÂª€ëôÅˆÏ³ûí›‰ïX…7b%gÄ˜‹&Ö~£á&+ñ2DV‚-ºDÌK Êàmò‹ıÍÁŠREW R¢ À >ŠŞ&ò "D{X—–¨ [ìÕófö$YwÊV_0‰+œ’-ÄhÑ5ÕQË
9™±”oùB|ÚÔ¸è[  “„è
˜]§Çšó[ë Æf©õgD¥+,«  «¦AmŒí³œµ@t Î[(=¾#AlÁRİêß;ê|Ê!ç}ù!JâXŠ¢¦ÊŒÊ@”ÁJ(&jmó4¿U¸›ŞºVî” @,€Ñº
˜…ŠMÆø¹îÿd¶§"¨t…*e `- sÀå a%ã É •uOãDJ^InğúvHA@HwÔæµš”°iÖã¦¥€°¿ÔŸ6E!cŸ<H,Ñy»hB.¨áºkÆÿiÿP%P° ” ¢ƒXÚ\f¡5~U—PÉsÜPù
WÒ¯u@ˆåÈœ‚yë@ÈÅ ¦Ærìå+à3‹cSGìCj  ØÒäf÷”…EmÊ0dµŸ±(²=0™å[CoL–2Ñ«[bIáXTgìA9K`vk„()÷ôC4UY'(ş”JW¸!ÿ¿=90{@*AİRĞ‹€P š*Ğ påÊBï½{H>"†d³ÿ÷¼%  ¢ƒ¦  @AFÃÙ"l´OßĞ1|Åjí¦û,à¬{™…p¢  Y<Ş
¾E¥+|¼ßf(è0&  åpÖX>ûÇ#úÍ›1C£Ïo*µ?Ò›Û•‰vbú3]‡  òÌÊÚä›¸¨ulÅ<4)İ?¹lAP%‹ H`õ! • @Õáßvi_ÙZé!ªĞ“Mo12!…Ä¤¢C*G¥¸Y/è‰23ª´Ü¬‡Tk­âq°£y}ãüôbÇLÎ›)V¶¨¼9dTÅ`yè\×Ô×—§nXÜÿ±UùZ/€Çäv¿óxÆÈK
`ÆöAp!¤†Aæ(ĞÿvÑ¤Ó+çËşõ ÊİG
 ¯Nÿì‘iÌºó´‡«?§Æçœ*S5*[,kŠŒfú®T‘CI¬¤›ƒÔÖµşV ˆr£®—ã­/¤|¸œºº9{éRq¡/á¶Ó 02É¿t0•H	ı)Wß³+adñ˜	ŸSxÃšÜh*ªå\“iüŸnx*è4Ú{¨h…¿|:ÿÕS×]½ºşÁñ‹–Ö·y^’T]Vµ Ã¼³?¾|7UÇSå#c©F£¦,3õ_»ÙsşY~ È•”§‡}NjSkœ¥‘¦“Ç^Šÿq_áˆĞâmY>Í4Ïû>Åšã±ìÀtaE“/–.Óæ$ET4«˜ÎÓã{/~ª¹¡r×›*Za&/uİ¿©»³{<]fiÊnb2%Ñk7æÊ2Æ(ÏIF>»)‘çi
ÏÚYí‹»ã¯l0í¿íË,Ö	ÁÀDR¸éö±!û&gÛèˆ×J hŒ¦s<MaNRUch,«:CaNRÓ%±«Á³xf«ïøÃÛg;ÿı®ö8×Ô÷<±/j&ü¦’Ï,·`&4Ñe…Nóì$o}º»±l?•¥Ûë]EÁÛ¶ôs/ï>ôÂ‹×_X‡ß\%zùPæDÓ×.Y·¬*¿ ìØİŸ(	"É \Ô ¦jl¢›Œ  œ¤g9D‰–±1OĞİpİÂñÙÂûRÑ
`•µ¯u1õ‰óş3bR5221~¸¿g &={0´3ºÎ×¸¤(Èüê¶¡w^yõ–ğÎ?ô¤Kíû““ƒûÍñ}ŸhŒ·´²İ­¦3…M oÌ™ é|ş×Oô´9C =Ï]ÑÒ¿ˆ2¯İ|ûÈ)Î;:o]áu¦m	Ù-4 L$Å{Ÿ‰í™ğä‚ë£/]Ô!İteıéï¬¨ô^xæêË‘@‡(Ï[•{âAË×öüóÎ#kARÈ”äj®rÔ\V¼w2²¡lDiNaÅ0œ’K^ËÓÖÏÈ½hÕ…‰üFÂ!§™áäDŸÏ¾l¼²'Æ;Ûõıo£Ò‡ögN$d^èÌ:9\D>Ùè·hQÑNNæU/‰ŠÕÀ”
©Hnçµu‡¿w}ÈbútAø0½O£jäÉ‰—{•=©zÉR«³VJWŸ]`o‰Ì\ºŞW¨¦ß 8>l
ßB´¡OKV5¿ŞpWîôÊ_É‡Váÿ?TôVó9Î„9…UÏœÂªgNaÕ3§°ê™SXõÌ)¬zæV=s
«9…UÏœÂªgNaÕ3§°ê™SXõÌ)¬zæV=s
«9…UÏ ~ÔÒıÊ6í     IEND®B`‚                                                                      <a class="reference internal" href="../libraries/index.html">Libraries</a><ul>
<li class="toctree-l2"><a class="reference internal" href="../libraries/benchmark.html">Benchmarking Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/caching.html">Caching Driver</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/calendar.html">Calendaring Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/cart.html">Shopping Cart Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/config.html">Config Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/email.html">Email Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/encrypt.html">Encrypt Class</a></li>
<li class="toctree-l2"><a class="reference internal" href="../libraries/encryption.html">Encryption Library</a></li>
<li class="toctree-l2"><a class="reference internal" hr<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Code Igniter
 *
 * An open source application development framework for PHP 5.1.6 or newer
 *
 * @package		CodeIgniter
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2008 - 2011, EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 1.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * Database Utility Class
 *
 * @category	Database
 * @author		ExpressionEngine Dev Team
 * @link		http://codeigniter.com/user_guide/database/
 */
class CI_DB_forge {

	var $fields			= array();
	var $keys			= array();
	var $primary_keys	= array();
	var $db_char_set	=	'';

	/**
	 * Constructor
	 *
	 * Grabs the CI super object instance so we can access it.
	 *
	 */
	function __construct()
	{
		// Assign the main database object to $this->db
		$CI =& get_instance();
		$this->db =& $CI->db;
		log_message('debug', "Database Forge Class Initialized");
	}

	// --------------------------------------------------------------------

	/**
	 * Create database
	 *
	 * @access	public
	 * @param	string	the database name
	 * @return	bool
	 */
	function create_database($db_name)
	{
		$sql = $this->_create_database($db_name);

		if (is_bool($sql))
		{
			return $sql;
		}

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Drop database
	 *
	 * @access	public
	 * @param	string	the database name
	 * @return	bool
	 */
	function drop_database($db_name)
	{
		$sql = $this->_drop_database($db_name);

		if (is_bool($sql))
		{
			return $sql;
		}

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Add Key
	 *
	 * @access	public
	 * @param	string	key
	 * @param	string	type
	 * @return	void
	 */
	function add_key($key = '', $primary = FALSE)
	{
		if (is_array($key))
		{
			foreach ($key as $one)
			{
				$this->add_key($one, $primary);
			}

			return;
		}

		if ($key == '')
		{
			show_error('Key information is required for that operation.');
		}

		if ($primary === TRUE)
		{
			$this->primary_keys[] = $key;
		}
		else
		{
			$this->keys[] = $key;
		}
	}

	// --------------------------------------------------------------------

	/**
	 * Add Field
	 *
	 * @access	public
	 * @param	string	collation
	 * @return	void
	 */
	function add_field($field = '')
	{
		if ($field == '')
		{
			show_error('Field information is required.');
		}

		if (is_string($field))
		{
			if ($field == 'id')
			{
				$this->add_field(array(
										'id' => array(
													'type' => 'INT',
													'constraint' => 9,
													'auto_increment' => TRUE
													)
								));
				$this->add_key('id', TRUE);
			}
			else
			{
				if (strpos($field, ' ') === FALSE)
				{
					show_error('Field information is required for that operation.');
				}

				$this->fields[] = $field;
			}
		}

		if (is_array($field))
		{
			$this->fields = array_merge($this->fields, $field);
		}

	}

	// --------------------------------------------------------------------

	/**
	 * Create Table
	 *
	 * @access	public
	 * @param	string	the table name
	 * @return	bool
	 */
	function create_table($table = '', $if_not_exists = FALSE)
	{
		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		if (count($this->fields) == 0)
		{
			show_error('Field information is required.');
		}

		$sql = $this->_create_table($this->db->dbprefix.$table, $this->fields, $this->primary_keys, $this->keys, $if_not_exists);

		$this->_reset();
		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Drop Table
	 *
	 * @access	public
	 * @param	string	the table name
	 * @return	bool
	 */
	function drop_table($table_name)
	{
		$sql = $this->_drop_table($this->db->dbprefix.$table_name);

		if (is_bool($sql))
		{
			return $sql;
		}

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Rename Table
	 *
	 * @access	public
	 * @param	string	the old table name
	 * @param	string	the new table name
	 * @return	bool
	 */
	function rename_table($table_name, $new_table_name)
	{
		if ($table_name == '' OR $new_table_name == '')
		{
			show_error('A table name is required for that operation.');
		}

		$sql = $this->_rename_table($this->db->dbprefix.$table_name, $this->db->dbprefix.$new_table_name);
		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Column Add
	 *
	 * @access	public
	 * @param	string	the table name
	 * @param	string	the column name
	 * @param	string	the column definition
	 * @return	bool
	 */
	function add_column($table = '', $field = array(), $after_field = '')
	{
		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		// add field info into field array, but we can only do one at a time
		// so we cycle through

		foreach ($field as $k => $v)
		{
			$this->add_field(array($k => $field[$k]));

			if (count($this->fields) == 0)
			{
				show_error('Field information is required.');
			}

			$sql = $this->_alter_table('ADD', $this->db->dbprefix.$table, $this->fields, $after_field);

			$this->_reset();

			if ($this->db->query($sql) === FALSE)
			{
				return FALSE;
			}
		}

		return TRUE;

	}

	// --------------------------------------------------------------------

	/**
	 * Column Drop
	 *
	 * @access	public
	 * @param	string	the table name
	 * @param	string	the column name
	 * @return	bool
	 */
	function drop_column($table = '', $column_name = '')
	{

		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		if ($column_name == '')
		{
			show_error('A column name is required for that operation.');
		}

		$sql = $this->_alter_table('DROP', $this->db->dbprefix.$table, $column_name);

		return $this->db->query($sql);
	}

	// --------------------------------------------------------------------

	/**
	 * Column Modify
	 *
	 * @access	public
	 * @param	string	the table name
	 * @param	string	the column name
	 * @param	string	the column definition
	 * @return	bool
	 */
	function modify_column($table = '', $field = array())
	{
		if ($table == '')
		{
			show_error('A table name is required for that operation.');
		}

		// add field info into field array, but we can only do one at a time
		// so we cycle through

		foreach ($field as $k => $v)
		{
			// If no name provided, use the current name
			if ( ! isset($field[$k]['name']))
			{
				$field[$k]['name'] = $k;
			}

			$this->add_field(array($k => $field[$k]));

			if (count($this->fields) == 0)
			{
				show_error('Field information is required.');
			}

			$sql = $this->_alter_table('CHANGE', $this->db->dbprefix.$table, $this->fields);

			$this->_reset();

			if ($this->db->query($sql) === FALSE)
			{
				return FALSE;
			}
		}

		return TRUE;
	}

	// --------------------------------------------------------------------

	/**
	 * Reset
	 *
	 * Resets table creation vars
	 *
	 * @access	private
	 * @return	void
	 */
	function _reset()
	{
		$this->fields		= array();
		$this->keys			= array();
		$this->primary_keys	= array();
	}

}

/* End of file DB_forge.php */
/* Location: ./system/database/DB_forge.php */                                                                                                                                                                                                                                         CA,aAAA,IAAA,IAAA,EACA,iBAAA,KAEA,iCxDw1LH,MAAA,IwDt1LC,OAAA,EACE,cAAA,KACA,aAAA,IAAA,IAAA,EACA,iBAAA,KAEA,kCxDw1LH,OAAA,EwDt1LC,KAAA,IACE,cAAA,KACA,aAAA,IAAA,IAAA,EACA,iBAAA,KAEA,8BxDw1LH,IAAA,IwDt1LC,KAAA,EACE,WAAA,KACA,aAAA,IAAA,IAAA,IAAA,EACA,mBAAA,KAEA,6BxDw1LH,IAAA,IwDt1LC,MAAA,EACE,WAAA,KACA,aAAA,IAAA,EAAA,IAAA,IACA,kBAAA,KAEA,+BxDw1LH,IAAA,EwDt1LC,KAAA,IACE,YAAA,KACA,aAAA,EAAA,IAAA,IACA,oBAAA,KAEA,oCxDw1LH,IAAA,EwDt1LC,MAAA,IACE,WAAA,KACA,aAAA,EAAA,IAAA,IACA,oBAAA,KAEA,qCxDw1LH,IAAA,E0Dr7LC,KAAM,IACWidth && (o.maxWidth < data.width),
			ismaxh = this._isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
			isminw = this._isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
			isminh = this._isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
			dw = this.originalPosition.left + this.originalSize.width,
			dh = this.position.top + this.size.height,
			cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
		if (isminw) {
			data.width = o.minWidth;
		}
		if (isminh) {
			data.height = o.minHeight;
		}
		if (ismaxw) {
			data.width = o.maxWidth;
		}
		if (ismaxh) {
			data.height = o.maxHeight;
		}

		if (isminw && cw) {
			data.left = dw - o.minWidth;
		}
		if (ismaxw && cw) {
			data.left = dw - o.maxWidth;
		}
		if (isminh && ch) {
			data.top = dh - o.minHeight;
		}
		if (ismaxh && ch) {
			data.top = dh - o.maxHeight;
		}

		// Fixing jump error on top/left - bug #2330
		if (!data.width && !data.height && !data.left && data.top) {
			data.top = null;
		} else if (!data.width && !data.height && !data.top && data.left) {
			data.left = null;
		}

		return data;
	},

	_getPaddingPlusBorderDimensions: function( element ) {
		var i = 0,
			widths = [],
			borders = [
				element.css( "borderTopWidth" ),
				element.css( "borderRightWidth" ),
				element.css( "borderBottomWidth" ),
				element.css( "borderLeftWidth" )
			],
			paddings = [
				element.css( "paddingTop" ),
				element.css( "paddingRight" ),
				element.css( "paddingBottom" ),
				element.css( "paddingLeft" )
			];

		for ( ; i < 4; i++ ) {
			widths[ i ] = ( parseInt( borders[ i ], 10 ) || 0 );
			widths[ i ] += ( parseInt( paddings[ i ], 10 ) || 0 );
		}

		return {
			height: widths[ 0 ] + widths[ 2 ],
			width: widths[ 1 ] + widths[ 3 ]
		};
	},

	_proportionallyResize: function() {

		if (!this._proportionallyResizeElements.length) {
			return;
		}

		var prel,
			i = 0,
			element = this.helper || this.element;

		for ( ; i < this._proportionallyResizeElements.length; i++) {

			prel = this._proportionallyResizeElements[i];

			// TODO: Seems like a bug to cache this.outerDimensions
			// considering that we are in a loop.
			if (!this.outerDimensions) {
				this.outerDimensions = this._getPaddingPlusBorderDimensions( prel );
			}

			prel.css({
				height: (element.height() - this.outerDimensions.height) || 0,
				width: (element.width() - this.outerDimensions.width) || 0
			});

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if (this._helper) {

			this.helper = this.helper || $("<div style='overflow:hidden;'></div>");

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() - 1,
				height: this.element.outerHeight() - 1,
				position: "absolute",
				left: this.elementOffset.left + "px",
				top: this.elementOffset.top + "px",
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [ event, this.ui() ]);
		(n !== "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "animate", {

	stop: function( event ) {
		var that = $(this).resizable( "instance" ),
			o = that.options,
			pr = that._proportionallyResizeElements,
			ista = pr.length && (/textarea/i).test(pr[0].nodeName),
			soffseth = ista && that._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height,
			soffsetw = ista ? 0 : that.sizeDiff.width,
			style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
			left = (parseInt(that.element.css("left"), 10) +
				(that.position.left - that.originalPosition.left)) || null,
			top = (parseInt(that.element.css("top"), 10) +
				(that.position.top - that.originalPosition.top)) || null;

		that.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(that.element.css("width"), 10),
						height: parseInt(that.element.css("height"), 10),
						top: parseInt(that.element.css("top"), 10),
						left: parseInt(that.element.css("left"), 10)
					};

					if (pr && pr.length) {
						$(pr[0]).css({ width: data.width, height: data.height });
					}

					// propagating resize, and updating values for each animation step
					that._updateCache(data);
					that._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add( "resizable", "containment", {

	start: function() {
		var element, p, co, ch, cw, width, height,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			el = that.element,
			oc = o.containment,
			ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( /parent/.test( oc ) ) ? el.parent().get( 0 ) : oc;

		if ( !ce ) {
			return;
		}

		that.containerElement = $( ce );

		if ( /document/.test( oc ) || oc === document ) {
			that.containerOffset = {
				left: 0,
				top: 0
			};
			that.containerPosition = {
				left: 0,
				top: 0
			};

			that.parentData = {
				element: $( document ),
				left: 0,
				top: 0,
				width: $( document ).width(),
				height: $( document ).height() || document.body.parentNode.scrollHeight
			};
		} else {
			element = $( ce );
			p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function( i, name ) {
				p[ i ] = that._num( element.css( "padding" + name ) );
			});

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = {
				height: ( element.innerHeight() - p[ 3 ] ),
				width: ( element.innerWidth() - p[ 1 ] )
			};

			co = that.containerOffset;
			ch = that.containerSize.height;
			cw = that.containerSize.width;
			width = ( that._hasScroll ( ce, "left" ) ? ce.scrollWidth : cw );
			height = ( that._hasScroll ( ce ) ? ce.scrollHeight : ch ) ;

			that.parentData = {
				element: ce,
				left: co.left,
				top: co.top,
				width: width,
				height: height
			};
		}
	},

	resize: function( event ) {
		var woset, hoset, isParent, isOffsetRelative,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey,
			cop = {
				top: 0,
				left: 0
			},
			ce = that.containerElement,
			continueResize = true;

		if ( ce[ 0 ] !== document && ( /static/ ).test( ce.css( "position" ) ) ) {
			cop = co;
		}

		if ( cp.left < ( that._helper ? co.left : 0 ) ) {
			that.size.width = that.size.width +
				( that._helper ?
					( that.position.left - co.left ) :
					( that.position.left - cop.left ) );

			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
			that.position.left = o.helper ? co.left : 0;
		}

		if ( cp.top < ( that._helper ? co.top : 0 ) ) {
			that.size.height = that.size.height +
				( that._helper ?
					( that.position.top - co.top ) :
					that.position.top );

			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
			that.position.top = that._helper ? co.top : 0;
		}

		isParent = that.containerElement.get( 0 ) === that.element.parent().get( 0 );
		isOffsetRelative = /relative|absolute/.test( that.containerElement.css( "position" ) );

		if ( isParent && isOffsetRelative ) {
			that.offset.left = that.parentData.left + that.position.left;
			that.offset.top = that.parentData.top + that.position.top;
		} else {
			that.offset.left = that.element.offset().left;
			that.offset.top = that.element.offset().top;
		}

		woset = Math.abs( that.sizeDiff.width +
			(that._helper ?
				that.offset.left - cop.left :
				(that.offset.left - co.left)) );

		hoset = Math.abs( that.sizeDiff.height +
			(that._helper ?
				that.offset.top - cop.top :
				(that.offset.top - co.top)) );

		if ( woset + that.size.width >= that.parentData.width ) {
			that.size.width = that.parentData.width - woset;
			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
		}

		if ( hoset + that.size.height >= that.parentData.height ) {
			that.size.height = that.parentData.height - hoset;
			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
		}

		if ( !continueResize ) {
			that.position.left = that.prevPosition.left;
			that.position.top = that.prevPosition.top;
			that.size.width = that.prevSize.width;
			that.size.height = that.prevSize.height;
		}
	},

	stop: function() {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cop = that.containerPosition,
			ce = that.containerElement,
			helper = $( that.helper ),
			ho = helper.offset(),
			w = helper.outerWidth() - that.sizeDiff.width,
			h = helper.outerHeight() - that.sizeDiff.height;

		if ( that._helper && !o.animate && ( /relative/ ).test( ce.css( "position" ) ) ) {
			$( this ).css({
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			});
		}

		if ( that._helper && !o.animate && ( /static/ ).test( ce.css( "position" ) ) ) {
			$( this ).css({
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			});
		}
	}
});

$.ui.plugin.add("resizable", "alsoResize", {

	start: function() {
		var that = $(this).resizable( "instance" ),
			o = that.options;

		$(o.alsoResize).each(function() {
			var el = $(this);
			el.data("ui-resizable-alsoresize", {
				width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
				left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
			});
		});
	},

	resize: function(event, ui) {
		var that = $(this).resizable( "instance" ),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: (that.size.height - os.height) || 0,
				width: (that.size.width - os.width) || 0,
				top: (that.position.top - op.top) || 0,
				left: (that.position.left - op.left) || 0
			};

			$(o.alsoResize).each(function() {
				var el = $(this), start = $(this).data("ui-resizable-alsoresize"), style = {},
					css = el.parents(ui.originalElement[0]).length ?
							[ "width", "height" ] :
							[ "width", "height", "top", "left" ];

				$.each(css, function(i, prop) {
					var sum = (start[prop] || 0) + (delta[prop] || 0);
					if (sum && sum >= 0) {
						style[prop] = sum || null;
					}
				});

				el.css(style);
			});
	},

	stop: function() {
		$(this).removeData("resizable-alsoresize");
	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function() {

		var that = $(this).resizable( "instance" ), o = that.options, cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost
			.css({
				opacity: 0.25,
				display: "block",
				position: "relative",
				height: cs.height,
				width: cs.width,
				margin: 0,
				left: 0,
				top: 0
			})
			.addClass("ui-resizable-ghost")
			.addClass(typeof o.ghost === "string" ? o.ghost : "");

		that.ghost.appendTo(that.helper);

	},

	resize: function() {
		var that = $(this).resizable( "instance" );
		if (that.ghost) {
			that.ghost.css({
				position: "relative",
				height: that.size.height,
				width: that.size.width
			});
		}
	},

	stop: function() {
		var that = $(this).resizable( "instance" );
		if (that.ghost && that.helper) {
			that.helper.get(0).removeChild(that.ghost.get(0));
		}
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function() {
		var outerDimensions,
			that = $(this).resizable( "instance" ),
			o = that.options,
			cs = that.size,
			os = that.originalSize,
			op = that.originalPosition,
			a = that.axis,
			grid = typeof o.grid === "number" ? [ o.grid, o.grid ] : o.grid,
			gridX = (grid[0] || 1),
			gridY = (grid[1] || 1),
			ox = Math.round((cs.width - os.width) / gridX) * gridX,
			oy = Math.round((cs.height - os.height) / gridY) * gridY,
			newWidth = os.width + ox,
			newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && (o.maxWidth < newWidth),
			isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
			isMinWidth = o.minWidth && (o.minWidth > newWidth),
			isMinHeight = o.minHeight && (o.minHeight > newHeight);

		o.grid = grid;

		if (isMinWidth) {
			newWidth += gridX;
		}
		if (isMinHeight) {
			newHeight += gridY;
		}
		if (isMaxWidth) {
			newWidth -= gridX;
		}
		if (isMaxHeight) {
			newHeight -= gridY;
		}

		if (/^(se|s|e)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if (/^(ne)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if (/^(sw)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			if ( newHeight - gridY <= 0 || newWidth - gridX <= 0) {
				outerDimensions = that._getPaddingPlusBorderDimensions( this );
			}

			if ( newHeight - gridY > 0 ) {
				that.size.height = newHeight;
				that.position.top = op.top - oy;
			} else {
				newHeight = gridY - outerDimensions.height;
				that.size.height = newHeight;
				that.position.top = op.top + os.height - newHeight;
			}
			if ( newWidth - gridX > 0 ) {
				that.size.width = newWidth;
				that.position.left = op.left - ox;
			} else {
				newWidth = gridX - outerDimensions.width;
				that.size.width = newWidth;
				that.position.left = op.left + os.width - newWidth;
			}
		}
	}

});

var resizable = $.ui.resizable;


/*!
 * jQuery UI Dialog 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 */


var dialog = $.widget( "ui.dialog", {
	version: "1.11.4",
	options: {
		appendTo: "body",
		autoOpen: true,
		buttons: [],
		closeOnEscape: true,
		closeText: "Close",
		dialogClass: "",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: null,
		maxWidth: null,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",
			// Ensure the titlebar is always visible
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		title: null,
		width: 300,

		// callbacks
		beforeClose: null,
		close: null,
		drag: null,
		dragStart: null,
		dragStop: null,
		focus: null,
		open: null,
		resize: null,
		resizeStart: null,
		resizeStop: null
	},

	sizeRelatedOptions: {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},

	resizableRelatedOptions: {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	},

	_create: function() {
		this.originalCss = {
			display: this.element[ 0 ].style.display,
			width: this.element[ 0 ].style.width,
			minHeight: this.element[ 0 ].style.minHeight,
			maxHeight: this.element[ 0 ].style.maxHeight,
			height: this.element[ 0 ].style.height
		};
		this.originalPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.originalTitle = this.element.attr( "title" );
		this.options.title = this.options.title || this.originalTitle;

		this._createWrapper();

		this.element
			.show()
			.removeAttr( "title" )
			.addClass( "ui-dialog-content ui-widget-content" )
			.appendTo( this.uiDialog );

		this._createTitlebar();
		this._createButtonPane();

		if ( this.options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( this.options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._isOpen = false;

		this._trackFocus();
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;
		if ( element && (element.jquery || element.nodeType) ) {
			return $( element );
		}
		return this.document.find( element || "body" ).eq( 0 );
	},

	_destroy: function() {
		var next,
			originalPosition = this.originalPosition;

		this._untrackInstance();
		this._destroyOverlay();

		this.element
			.removeUniqueId()
			.removeClass( "ui-dialog-content ui-widget-content" )
			.css( this.originalCss )
			// Without detaching first, the following becomes really slow
			.detach();

		this.uiDialog.stop( true, true ).remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = originalPosition.parent.children().eq( originalPosition.index );
		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[ 0 ] !== this.element[ 0 ] ) {
			next.before( this.element );
		} else {
			originalPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	disable: $.noop,
	enable: $.noop,

	close: function( event ) {
		var activeElement,
			that = this;

		if ( !this._isOpen || this._trigger( "beforeClose", event ) === false ) {
			return;
		}

		this._isOpen = false;
		this._focusedElement = null;
		this._destroyOverlay();
		this._untrackInstance();

		if ( !this.opener.filter( ":focusable" ).focus().length ) {

			// support: IE9
			// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
			try {
				activeElement = this.document[ 0 ].activeElement;

				// Support: IE9, IE10
				// If the <body> is blurred, IE will switch windows, see #4520
				if ( activeElement && activeElement.nodeName.toLowerCase() !== "body" ) {

					// Hiding a focused element doesn't trigger blur in WebKit
					// so in case we have nothing to focus on, explicitly blur the active element
					// https://bugs.webkit.org/show_bug.cgi?id=47182
					$( activeElement ).blur();
				}
			} catch ( error ) {}
		}

		this._hide( this.uiDialog, this.options.hide, function() {
			that._trigger( "close", event );
		});
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function() {
		this._moveToTop();
	},

	_moveToTop: function( event, silent ) {
		var moved = false,
			zIndices = this.uiDialog.siblings( ".ui-front:visible" ).map(function() {
				return +$( this ).css( "z-index" );
			}).get(),
			zIndexMax = Math.max.apply( null, zIndices );

		if ( zIndexMax >= +this.uiDialog.css( "z-index" ) ) {
			this.uiDialog.css( "z-index", zIndexMax + 1 );
			moved = true;
		}

		if ( moved && !silent ) {
			this._trigger( "focus", event );
		}
		return moved;
	},

	open: function() {
		var that = this;
		if ( this._isOpen ) {
			if ( this._moveToTop() ) {
				this._focusTabbable();
			}
			return;
		}

		this._isOpen = true;
		this.opener = $( this.document[ 0 ].activeElement );

		this._size();
		this._position();
		this._createOverlay();
		this._moveToTop( null, true );

		// Ensure the overlay is moved to the top with the dialog, but only when
		// opening. The overlay shouldn't move after the dialog is open so that
		// modeless dialogs opened after the modal dialog stack properly.
		if ( this.overlay ) {
			this.overlay.css( "z-index", this.uiDialog.css( "z-index" ) - 1 );
		}

		this._show( this.uiDialog, this.options.show, function() {
			that._focusTabbable();
			that._trigger( "focus" );
		});

		// Track the dialog immediately upon openening in case a focus event
		// somehow occurs outside of the dialog before an element inside the
		// dialog is focused (#10152)
		this._makeFocusTarget();

		this._trigger( "open" );
	},

	_focusTabbable: function() {
		// Set focus to the first match:
		// 1. An element that was focused previously
		// 2. First element inside the dialog matching [autofocus]
		// 3. Tabbable element inside the content element
		// 4. Tabbable element inside the buttonpane
		// 5. The close button
		// 6. The dialog itself
		var hasFocus = this._focusedElement;
		if ( !hasFocus ) {
			hasFocus = this.element.find( "[autofocus]" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.element.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogTitlebarClose.filter( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialog;
		}
		hasFocus.eq( 0 ).focus();
	},

	_keepFocus: function( event ) {
		function checkFocus() {
			var activeElement = this.document[0].activeElement,
				isActive = this.uiDialog[0] === activeElement ||
					$.contains( this.uiDialog[0], activeElement );
			if ( !isActive ) {
				this._focusTabbable();
			}
		}
		event.preventDefault();
		checkFocus.call( this );
		// support: IE
		// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
		// so we check again later
		this._delay( checkFocus );
	},

	_createWrapper: function() {
		this.uiDialog = $("<div>")
			.addClass( "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " +
				this.options.dialogClass )
			.hide()
			.attr({
				// Setting tabIndex makes the div focusable
				tabIndex: -1,
				role: "dialog"
			})
			.appendTo( this._appendTo() );

		this._on( this.uiDialog, {
			keydown: function( event ) {
				if ( this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE ) {
					event.preventDefault();
					this.close( event );
					return;
				}

				// prevent tabbing out of dialogs
				if ( event.keyCode !== $.ui.keyCode.TAB || event.isDefaultPrevented() ) {
					return;
				}
				var tabbables = this.uiDialog.find( ":tabbable" ),
					first = tabbables.filter( ":first" ),
					last = tabbables.filter( ":last" );

				if ( ( event.target === last[0] || event.target === this.uiDialog[0] ) && !event.shiftKey ) {
					this._delay(function() {
						first.focus();
					});
					event.preventDefault();
				} else if ( ( event.target === first[0] || event.target === this.uiDialog[0] ) && event.shiftKey ) {
					this._delay(function() {
						last.focus();
					});
					event.preventDefault();
				}
			},
			mousedown: function( event ) {
				if ( this._moveToTop( event ) ) {
					this._focusTabbable();
				}
			}
		});

		// We assume that any existing aria-describedby attribute means
		// that the dialog content is marked up properly
		// otherwise we brute force the content as the description
		if ( !this.element.find( "[aria-describedby]" ).length ) {
			this.uiDialog.attr({
				"aria-describedby": this.element.uniqueId().attr( "id" )
			});
		}
	},

	_createTitlebar: function() {
		var uiDialogTitle;

		this.uiDialogTitlebar = $( "<div>" )
			.addClass( "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" )
			.prependTo( this.uiDialog );
		this._on( this.uiDialogTitlebar, {
			mousedown: function( event ) {
				// Don't prevent click on close button (#8838)
				// Focusing a dialog that is partially scrolled out of view
				// causes the browser to scroll it into view, preventing the click event
				if ( !$( event.target ).closest( ".ui-dialog-titlebar-close" ) ) {
					// Dialog isn't getting focus when dragging (#8063)
					this.uiDialog.focus();
				}
			}
		});

		// support: IE
		// Use type="button" to prevent enter keypresses in textboxes from closing the
		// dialog in IE (#9312)
		this.uiDialogTitlebarClose = $( "<button type='button'></button>" )
			.button({
				label: this.options.closeText,
				icons: {
					primary: "ui-icon-closethick"
				},
				text: false
			})
			.addClass( "ui-dialog-titlebar-close" )
			.appendTo( this.uiDialogTitlebar );
		this._on( this.uiDialogTitlebarClose, {
			click: function( event ) {
				event.preventDefault();
				this.close( event );
			}
		});

		uiDialogTitle = $( "<span>" )
			.uniqueId()
			.addClass( "ui-dialog-title" )
			.prependTo( this.uiDialogTitlebar );
		this._title( uiDialogTitle );

		this.uiDialog.attr({
			"aria-labelledby": uiDialogTitle.attr( "id" )
		});
	},

	_title: function( title ) {
		if ( !this.options.title ) {
			title.html( "&#160;" );
		}
		title.text( this.options.title );
	},

	_createButtonPane: function() {
		this.uiDialogButtonPane = $( "<div>" )
			.addClass( "ui-dialog-buttonpane ui-widget-content ui-helper-clearfix" );

		this.uiButtonSet = $( "<div>" )
			.addClass( "ui-dialog-buttonset" )
			.appendTo( this.uiDialogButtonPane );

		this._createButtons();
	},

	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons;

		// if we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( $.isEmptyObject( buttons ) || ($.isArray( buttons ) && !buttons.length) ) {
			this.uiDialog.removeClass( "ui-dialog-buttons" );
			return;
		}

		$.each( buttons, function( name, props ) {
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;
			// Default to a non-submitting button
			props = $.extend( { type: "button" }, props );
			// Change the context for the click callback to be the main element
			click = props.click;
			props.click = function() {
				click.apply( that.element[ 0 ], arguments );
			};
			buttonOptions = {
				icons: props.icons,
				text: props.showText
			};
			delete props.icons;
			delete props.showText;
			$( "<button></button>", props )
				.button( buttonOptions )
				.appendTo( that.uiButtonSet );
		});
		this.uiDialog.addClass( "ui-dialog-buttons" );
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable({
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-dragging" );
				that._blockFrames();
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var left = ui.offset.left - that.document.scrollLeft(),
					top = ui.offset.top - that.document.scrollTop();

				options.position = {
					my: "left top",
					at: "left" + (left >= 0 ? "+" : "") + left + " " +
						"top" + (top >= 0 ? "+" : "") + top,
					of: that.window
				};
				$( this ).removeClass( "ui-dialog-dragging" );
				that._unblockFrames();
				that._trigger( "dragStop", event, filteredUi( ui ) );
			}
		});
	},

	_makeResizable: function() {
		var that = this,
			options = this.options,
			handles = options.resizable,
			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css("position"),
			resizeHandles = typeof handles === "string" ?
				handles	:
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable({
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-resizing" );
				that._blockFrames();
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var offset = that.uiDialog.offset(),
					left = offset.left - that.document.scrollLeft(),
					top = offset.top - that.document.scrollTop();

				options.height = that.uiDialog.height();
				options.width = that.uiDialog.width();
				options.position = {
					my: "left top",
					at: "left" + (left >= 0 ? "+" : "") + left + " " +
						"top" + (top >= 0 ? "+" : "") + top,
					of: that.window
				};
				$( this ).removeClass( "ui-dialog-resizing" );
				that._unblockFrames();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
			}
		})
		.css( "position", position );
	},

	_trackFocus: function() {
		this._on( this.widget(), {
			focusin: function( event ) {
				this._makeFocusTarget();
				this._focusedElement = $( event.target );
			}
		});
	},

	_makeFocusTarget: function() {
		this._untrackInstance();
		this._trackingInstances().unshift( this );
	},

	_untrackInstance: function() {
		var instances = this._trackingInstances(),
			exists = $.inArray( this, instances );
		if ( exists !== -1 ) {
			instances.splice( exists, 1 );
		}
	},

	_trackingInstances: function() {
		var instances = this.document.data( "ui-dialog-instances" );
		if ( !instances ) {
			instances = [];
			this.document.data( "ui-dialog-instances", instances );
		}
		return instances;
	},

	_minHeight: function() {
		var options = this.options;

		return options.height === "auto" ?
			options.minHeight :
			Math.min( options.minHeight, options.height );
	},

	_position: function() {
		// Need to show the dialog to get the actual offset in the position plugin
		var isVisible = this.uiDialog.is( ":visible" );
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( this.options.position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resize = false,
			resizableOptions = {};

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in that.sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in that.resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
			this._position();
		}
		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		if ( key === "dialogClass" ) {
			uiDialog
				.removeClass( this.options.dialogClass )
				.addClass( value );
		}

		if ( key === "disabled" ) {
			return;
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.uiDialog.appendTo( this._appendTo() );
		}

		if ( key === "buttons" ) {
			this._createButtons();
		}

		if ( key === "closeText" ) {
			this.uiDialogTitlebarClose.button({
				// Ensure that we always pass a string
				label: "" + value
			});
		}

		if ( key === "draggable" ) {
			isDraggable = uiDialog.is( ":data(ui-draggable)" );
			if ( isDraggable && !value ) {
				uiDialog.draggable( "destroy" );
			}

			if ( !isDraggable && value ) {
				this._makeDraggable();
			}
		}

		if ( key === "position" ) {
			this._position();
		}

		if ( key === "resizable" ) {
			// currently resizable, becoming non-resizable
			isResizable = uiDialog.is( ":data(ui-resizable)" );
			if ( isResizable && !value ) {
				uiDialog.resizable( "destroy" );
			}

			// currently resizable, changing handles
			if ( isResizable && typeof value === "string" ) {
				uiDialog.resizable( "option", "handles", value );
			}

			// currently non-resizable, becoming resizable
			if ( !isResizable && value !== false ) {
				this._makeResizable();
			}
		}

		if ( key === "title" ) {
			this._title( this.uiDialogTitlebar.find( ".ui-dialog-title" ) );
		}
	},

	_size: function() {
		// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight, maxContentHeight,
			options = this.options;

		// Reset content sizing
		this.element.show().css({
			width: "auto",
			minHeight: 0,
			maxHeight: "none",
			height: 0
		});

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: "auto",
				width: options.width
			})
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		maxContentHeight = typeof options.maxHeight === "number" ?
			Math.max( 0, options.maxHeight - nonContentHeight ) :
			"none";

		if ( options.height === "auto" ) {
			this.element.css({
				minHeight: minContentHeight,
				maxHeight: maxContentHeight,
				height: "auto"
			});
		} else {
			this.element.height( Math.max( 0, options.height - nonContentHeight ) );
		}

		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	},

	_blockFrames: function() {
		this.iframeBlocks = this.document.find( "iframe" ).map(function() {
			var iframe = $( this );

			return $( "<div>" )
				.css({
					position: "absolute",
					width: iframe.outerWidth(),
					height: iframe.outerHeight()
				})
				.appendTo( iframe.parent() )
				.offset( iframe.offset() )[0];
		});
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_allowInteraction: function( event ) {
		if ( $( event.target ).closest( ".ui-dialog" ).length ) {
			return true;
		}

		// TODO: Remove hack when datepicker implements
		// the .ui-front logic (#8989)
		return !!$( event.target ).closest( ".ui-datepicker" ).length;
	},

	_createOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		// We use a delay in case the overlay is created from an
		// event that we're going to be cancelling (#2804)
		var isOpening = true;
		this._delay(function() {
			isOpening = false;
		});

		if ( !this.document.data( "ui-dialog-overlays" ) ) {

			// Prevent use of anchors and inputs
			// Using _on() for an event handler shared across many instances is
			// safe because the dialogs stack and must be closed in reverse order
			this._on( this.document, {
				focusin: function( event ) {
					if ( isOpening ) {
						return;
					}

					if ( !this._allowInteraction( event ) ) {
						event.preventDefault();
						this._trackingInstances()[ 0 ]._focusTabbable();
					}
				}
			});
		}

		this.overlay = $( "<div>" )
			.addClass( "ui-widget-overlay ui-front" )
			.appendTo( this._appendTo() );
		this._on( this.overlay, {
			mousedown: "_keepFocus"
		});
		this.document.data( "ui-dialog-overlays",
			(this.document.data( "ui-dialog-overlays" ) || 0) + 1 );
	},

	_destroyOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		if ( this.overlay ) {
			var overlays = this.document.data( "ui-dialog-overlays" ) - 1;

			if ( !overlays ) {
				this.document
					.unbind( "focusin" )
					.removeData( "ui-dialog-overlays" );
			} else {
				this.document.data( "ui-dialog-overlays", overlays );
			}

			this.overlay.remove();
			this.overlay = null;
		}
	}
});


/*!
 * jQuery UI Droppable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/droppable/
 */


$.widget( "ui.droppable", {
	version: "1.11.4",
	widgetEventPrefix: "drop",
	options: {
		accept: "*",
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: false,
		scope: "default",
		tolerance: "intersect",

		// callbacks
		activate: null,
		deactivate: null,
		drop: null,
		out: null,
		over: null
	},
	_create: function() {

		var proportions,
			o = this.options,
			accept = o.accept;

		this.isover = false;
		this.isout = true;

		this.accept = $.isFunction( accept ) ? accept : function( d ) {
			return d.is( accept );
		};

		this.proportions = function( /* valueToWrite */ ) {
			if ( arguments.length ) {
				// Store the droppable's proportions
				proportions = arguments[ 0 ];
			} else {
				// Retrieve or derive the droppable's proportions
				return proportions ?
					proportions :
					proportions = {
						width: this.element[ 0 ].offsetWidth,
						height: this.element[ 0 ].offsetHeight
					};
			}
		};

		this._addToManager( o.scope );

		o.addClasses && this.element.addClass( "ui-droppable" );

	},

	_addToManager: function( scope ) {
		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[ scope ] = $.ui.ddmanager.droppables[ scope ] || [];
		$.ui.ddmanager.droppables[ scope ].push( this );
	},

	_splice: function( drop ) {
		var i = 0;
		for ( ; i < drop.length; i++ ) {
			if ( drop[ i ] === this ) {
				drop.splice( i, 1 );
			}
		}
	},

	_destroy: function() {
		var drop = $.ui.ddmanager.droppables[ this.options.scope ];

		this._splice( drop );

		this.element.removeClass( "ui-droppable ui-droppable-disabled" );
	},

	_setOption: function( key, value ) {

		if ( key === "accept" ) {
			this.accept = $.isFunction( value ) ? value : function( d ) {
				return d.is( value );
			};
		} else if ( key === "scope" ) {
			var drop = $.ui.ddmanager.droppables[ this.options.scope ];

			this._splice( drop );
			this._addToManager( value );
		}

		this._super( key, value );
	},

	_activate: function( event ) {
		var draggable = $.ui.ddmanager.current;
		if ( this.options.activeClass ) {
			this.element.addClass( this.options.activeClass );
		}
		if ( draggable ){
			this._trigger( "activate", event, this.ui( draggable ) );
		}
	},

	_deactivate: function( event ) {
		var draggable = $.ui.ddmanager.current;
		if ( this.options.activeClass ) {
			this.element.removeClass( this.options.activeClass );
		}
		if ( draggable ){
			this._trigger( "deactivate", event, this.ui( draggable ) );
		}
	},

	_over: function( event ) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
			if ( this.options.hoverClass ) {
				this.element.addClass( this.options.hoverClass );
			}
			this._trigger( "over", event, this.ui( draggable ) );
		}

	},

	_out: function( event ) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
			if ( this.options.hoverClass ) {
				this.element.removeClass( this.options.hoverClass );
			}
			this._trigger( "out", event, this.ui( draggable ) );
		}

	},

	_drop: function( event, custom ) {

		var draggable = custom || $.ui.ddmanager.current,
			childrenIntersection = false;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem || draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return false;
		}

		this.element.find( ":data(ui-droppable)" ).not( ".ui-draggable-dragging" ).each(function() {
			var inst = $( this ).droppable( "instance" );
			if (
				inst.options.greedy &&
				!inst.options.disabled &&
				inst.options.scope === draggable.options.scope &&
				inst.accept.call( inst.element[ 0 ], ( draggable.currentItem || draggable.element ) ) &&
				$.ui.intersect( draggable, $.extend( inst, { offset: inst.element.offset() } ), inst.options.tolerance, event )
			) { childrenIntersection = true; return false; }
		});
		if ( childrenIntersection ) {
			return false;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
			if ( this.options.activeClass ) {
				this.element.removeClass( this.options.activeClass );
			}
			if ( this.options.hoverClass ) {
				this.element.removeClass( this.options.hoverClass );
			}
			this._trigger( "drop", event, this.ui( draggable ) );
			return this.element;
		}

		return false;

	},

	ui: function( c ) {
		return {
			draggable: ( c.currentItem || c.element ),
			helper: c.helper,
			position: c.position,
			offset: c.positionAbs
		};
	}

});

$.ui.intersect = (function() {
	function isOverAxis( x, reference, size ) {
		return ( x >= reference ) && ( x < ( reference + size ) );
	}

	return function( draggable, droppable, toleranceMode, event ) {

		if ( !droppable.offset ) {
			return false;
		}

		var x1 = ( draggable.positionAbs || draggable.position.absolute ).left + draggable.margins.left,
			y1 = ( draggable.positionAbs || draggable.position.absolute ).top + draggable.margins.top,
			x2 = x1 + draggable.helperProportions.width,
			y2 = y1 + draggable.helperProportions.height,
			l = droppable.offset.left,
			t = droppable.offset.top,
			r = l + droppable.proportions().width,
			b = t + droppable.proportions().height;

		switch ( toleranceMode ) {
		case "fit":
			return ( l <= x1 && x2 <= r && t <= y1 && y2 <= b );
		case "intersect":
			return ( l < x1 + ( draggable.helperProportions.width / 2 ) && // Right Half
				x2 - ( draggable.helperProportions.width / 2 ) < r && // Left Half
				t < y1 + ( draggable.helperProportions.height / 2 ) && // Bottom Half
				y2 - ( draggable.helperProportions.height / 2 ) < b ); // Top Half
		case "pointer":
			return isOverAxis( event.pageY, t, droppable.proportions().height ) && isOverAxis( event.pageX, l, droppable.proportions().width );
		case "touch":
			return (
				( y1 >= t && y1 <= b ) || // Top edge touching
				( y2 >= t && y2 <= b ) || // Bottom edge touching
				( y1 < t && y2 > b ) // Surrounded vertically
			) && (
				( x1 >= l && x1 <= r ) || // Left edge touching
				( x2 >= l && x2 <= r ) || // Right edge touching
				( x1 < l && x2 > r ) // Surrounded horizontally
			);
		default:
			return false;
		}
	};
})();

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { "default": [] },
	prepareOffsets: function( t, event ) {

		var i, j,
			m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
			type = event ? event.type : null, // workaround for #2317
			list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();

		droppablesLoop: for ( i = 0; i < m.length; i++ ) {

			// No disabled and non-accepted
			if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
				continue;
			}

			// Filter out elements in the current dragged item
			for ( j = 0; j < list.length; j++ ) {
				if ( list[ j ] === m[ i ].element[ 0 ] ) {
					m[ i ].proportions().height = 0;
					continue droppablesLoop;
				}
			}

			m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
			if ( !m[ i ].visible ) {
				continue;
			}

			// Activate the droppable if used directly from draggables
			if ( type === "mousedown" ) {
				m[ i ]._activate.call( m[ i ], event );
			}

			m[ i ].offset = m[ i ].element.offset();
			m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });

		}

	},
	drop: function( draggable, event ) {

		var dropped = false;
		// Create a copy of the droppables in case the list changes during the drop (#9116)
		$.each( ( $.ui.ddmanager.droppables[ draggable.options.scope ] || [] ).slice(), function() {

			if ( !this.options ) {
				return;
			}
			if ( !this.options.disabled && this.visible && $.ui.intersect( draggable, this, this.options.tolerance, event ) ) {
				dropped = this._drop.call( this, event ) || dropped;
			}

			if ( !this.options.disabled && this.visible && this.accept.call( this.element[ 0 ], ( draggable.currentItem || draggable.element ) ) ) {
				this.isout = true;
				this.isover = false;
				this._deactivate.call( this, event );
			}

		});
		return dropped;

	},
	dragStart: function( draggable, event ) {
		// Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
			if ( !draggable.options.refreshPositions ) {
				$.ui.ddmanager.prepareOffsets( draggable, event );
			}
		});
	},
	drag: function( draggable, event ) {

		// If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if ( draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}

		// Run through all droppables and check their positions based on specific tolerance options
		$.each( $.ui.ddmanager.droppables[ draggable.options.scope ] || [], function() {

			if ( this.options.disabled || this.greedyChild || !this.visible ) {
				return;
			}

			var parentInstance, scope, parent,
				intersects = $.ui.intersect( draggable, this, this.options.tolerance, event ),
				c = !intersects && this.isover ? "isout" : ( intersects && !this.isover ? "isover" : null );
			if ( !c ) {
				return;
			}

			if ( this.options.greedy ) {
				// find droppable parents with same scope
				scope = this.options.scope;
				parent = this.element.parents( ":data(ui-droppable)" ).filter(function() {
					return $( this ).droppable( "instance" ).options.scope === scope;
				});

				if ( parent.length ) {
					parentInstance = $( parent[ 0 ] ).droppable( "instance" );
					parentInstance.greedyChild = ( c === "isover" );
				}
			}

			// we just moved into a greedy child
			if ( parentInstance && c === "isover" ) {
				parentInstance.isover = false;
				parentInstance.isout = true;
				parentInstance._out.call( parentInstance, event );
			}

			this[ c ] = true;
			this[c === "isout" ? "isover" : "isout"] = false;
			this[c === "isover" ? "_over" : "_out"].call( this, event );

			// we just moved out of a greedy child
			if ( parentInstance && c === "isout" ) {
				parentInstance.isout = false;
				parentInstance.isover = true;
				parentInstance._over.call( parentInstance, event );
			}
		});

	},
	dragStop: function( draggable, event ) {
		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
		// Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
		if ( !draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}
	}
};

var droppable = $.ui.droppable;


/*!
 * jQuery UI Effects 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/effects-core/
 */


var dataSpace = "ui-effects-",

	// Create a local jQuery because jQuery Color relies on it and the
	// global may not exist with AMD and a custom build (#10199)
	jQuery = $;

$.effects = {
	effect: {}
};

/*!
 * jQuery Color Animations v2.1.2
 * https://github.com/jquery/jquery-color
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: Wed Jan 16 08:47:09 2013 -0600
 */
(function( jQuery, undefined ) {

	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",

	// plusequals test for += 100 -= 100
	rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
	// a set of RE's that can match strings and generate color tuples.
	stringParsers = [ {
			re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ],
					execResult[ 3 ],
					execResult[ 4 ]
				];
			}
		}, {
			re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ] * 2.55,
					execResult[ 2 ] * 2.55,
					execResult[ 3 ] * 2.55,
					execResult[ 4 ]
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ], 16 )
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
				];
			}
		}, {
			re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			space: "hsla",
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ] / 100,
					execResult[ 3 ] / 100,
					execResult[ 4 ]
				];
			}
		} ],

	// jQuery.Color( )
	color = jQuery.Color = function( color, green, blue, alpha ) {
		return new jQuery.Color.fn.parse( color, green, blue, alpha );
	},
	spaces = {
		rgba: {
			props: {
				red: {
					idx: 0,
					type: "byte"
				},
				green: {
					idx: 1,
					type: "byte"
				},
				blue: {
					idx: 2,
					type: "byte"
				}
			}
		},

		hsla: {
			props: {
				hue: {
					idx: 0,
					type: "degrees"
				},
				saturation: {
					idx: 1,
					type: "percent"
				},
				lightness: {
					idx: 2,
					type: "percent"
				}
			}
		}
	},
	propTypes = {
		"byte": {
			floor: true,
			max: 255
		},
		"percent": {
			max: 1
		},
		"degrees": {
			mod: 360,
			floor: true
		}
	},
	support = color.support = {},

	// element for support tests
	supportElem = jQuery( "<p>" )[ 0 ],

	// colors = jQuery.Color.names
	colors,

	// local aliases of functions called often
	each = jQuery.each;

// determine rgba support immediately
supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
support.rgba = supportElem.style.backgroundColor.indexOf( "rgba" ) > -1;

// define cache name and alpha properties
// for rgba and hsla spaces
each( spaces, function( spaceName, space ) {
	space.cache = "_" + spaceName;
	space.props.alpha = {
		idx: 3,
		type: "percent",
		def: 1
	};
});

function clamp( value, prop, allowEmpty ) {
	var type = propTypes[ prop.type ] || {};

	if ( value == null ) {
		return (allowEmpty || !prop.def) ? null : prop.def;
	}

	// ~~ is an short way of doing floor for positive numbers
	value = type.floor ? ~~value : parseFloat( value );

	// IE will pass in empty strings as value for alpha,
	// which will hit this case
	if ( isNaN( value ) ) {
		return prop.def;
	}

	if ( type.mod ) {
		// we add mod before modding to make sure that negatives values
		// get converted properly: -10 -> 350
		return (value + type.mod) % type.mod;
	}

	// for now all property types without mod have min and max
	return 0 > value ? 0 : type.max < value ? type.max : value;
}

function stringParse( string ) {
	var inst = color(),
		rgba = inst._rgba = [];

	string = string.toLowerCase();

	each( stringParsers, function( i, parser ) {
		var parsed,
			match = parser.re.exec( string ),
			values = match && parser.parse( match ),
			spaceName = parser.space || "rgba";

		if ( values ) {
			parsed = inst[ spaceName ]( values );

			// if this was an rgba parse the assignment might happen twice
			// oh well....
			inst[ spaces[ spaceName ].cache ] = parsed[ spaces[ spaceName ].cache ];
			rgba = inst._rgba = parsed._rgba;

			// exit each( stringParsers ) here because we matched
			return false;
		}
	});

	// Found a stringParser that handled it
	if ( rgba.length ) {

		// if this came from a parsed string, force "transparent" when alpha is 0
		// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
		if ( rgba.join() === "0,0,0,0" ) {
			jQuery.extend( rgba, colors.transparent );
		}
		return inst;
	}

	// named colors
	return colors[ string ];
}

color.fn = jQuery.extend( color.prototype, {
	parse: function( red, green, blue, alpha ) {
		if ( red === undefined ) {
			this._rgba = [ null, null, null, null ];
			return this;
		}
		if ( red.jquery || red.nodeType ) {
			red = jQuery( red ).css( green );
			green = undefined;
		}

		var inst = this,
			type = jQuery.type( red ),
			rgba = this._rgba = [];

		// more than 1 argument specified - assume ( red, green, blue, alpha )
		if ( green !== undefined ) {
			red = [ red, green, blue, alpha ];
			type = "array";
		}

		if ( type === "string" ) {
			return this.parse( stringParse( red ) || colors._default );
		}

		if ( type === "array" ) {
			each( spaces.rgba.props, function( key, prop ) {
				rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
			});
			return this;
		}

		if ( type === "object" ) {
			if ( red instanceof color ) {
				each( spaces, function( spaceName, space ) {
					if ( red[ space.cache ] ) {
						inst[ space.cache ] = red[ space.cache ].slice();
					}
				});
			} else {
				each( spaces, function( spaceName, space ) {
					var cache = space.cache;
					each( space.props, function( key, prop ) {

						// if the cache doesn't exist, and we know how to convert
						if ( !inst[ cache ] && space.to ) {

							// if the value was null, we don't need to copy it
							// if the key was alpha, we don't need to copy it either
							if ( key === "alpha" || red[ key ] == null ) {
								return;
							}
							inst[ cache ] = space.to( inst._rgba );
						}

						// this is the only case where we allow nulls for ALL properties.
						// call clamp with alwaysAllowEmpty
						inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
					});

					// everything defined but alpha?
					if ( inst[ cache ] && jQuery.inArray( null, inst[ cache ].slice( 0, 3 ) ) < 0 ) {
						// use the default of 1
						inst[ cache ][ 3 ] = 1;
						if ( space.from ) {
							inst._rgba = space.from( inst[ cache ] );
						}
					}
				});
			}
			return this;
		}
	},
	is: function( compare ) {
		var is = color( compare ),
			same = true,
			inst = this;

		each( spaces, function( _, space ) {
			var localCache,
				isCache = is[ space.cache ];
			if (isCache) {
				localCache = inst[ space.cache ] || space.to && space.to( inst._rgba ) || [];
				each( space.props, function( _, prop ) {
					if ( isCache[ prop.idx ] != null ) {
						same = ( isCache[ prop.idx ] === localCache[ prop.idx ] );
						return same;
					}
				});
			}
			return same;
		});
		return same;
	},
	_space: function() {
		var used = [],
			inst = this;
		each( spaces, function( spaceName, space ) {
			if ( inst[ space.cache ] ) {
				used.push( spaceName );
			}
		});
		return used.pop();
	},
	transition: function( other, distance ) {
		var end = color( other ),
			spaceName = end._space(),
			space = spaces[ spaceName ],
			startColor = this.alpha() === 0 ? color( "transparent" ) : this,
			start = startColor[ space.cache ] || space.to( startColor._rgba ),
			result = start.slice();

		end = end[ space.cache ];
		each( space.props, function( key, prop ) {
			var index = prop.idx,
				startValue = start[ index ],
				endValue = end[ index ],
				type = propTypes[ prop.type ] || {};

			// if null, don't override start value
			if ( endValue === null ) {
				return;
			}
			// if null - use end
			if ( startValue === null ) {
				result[ index ] = endValue;
			} else {
				if ( type.mod ) {
					if ( endValue - startValue > type.mod / 2 ) {
						startValue += type.mod;
					} else if ( startValue - endValue > type.mod / 2 ) {
						startValue -= type.mod;
					}
				}
				result[ index ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
			}
		});
		return this[ spaceName ]( result );
	},
	blend: function( opaque ) {
		// if we are already opaque - return ourself
		if ( this._rgba[ 3 ] === 1 ) {
			return this;
		}

		var rgb = this._rgba.slice(),
			a = rgb.pop(),
			blend = color( opaque )._rgba;

		return color( jQuery.map( rgb, function( v, i ) {
			return ( 1 - a ) * blend[ i ] + a * v;
		}));
	},
	toRgbaString: function() {
		var prefix = "rgba(",
			rgba = jQuery.map( this._rgba, function( v, i ) {
				return v == null ? ( i > 2 ? 1 : 0 ) : v;
			});

		if ( rgba[ 3 ] === 1 ) {
			rgba.pop();
			prefix = "rgb(";
		}

		return prefix + rgba.join() + ")";
	},
	toHslaString: function() {
		var prefix = "hsla(",
			hsla = jQuery.map( this.hsla(), function( v, i ) {
				if ( v == null ) {
					v = i > 2 ? 1 : 0;
				}

				// catch 1 and 2
				if ( i && i < 3 ) {
					v = Math.round( v * 100 ) + "%";
				}
				return v;
			});

		if ( hsla[ 3 ] === 1 ) {
			hsla.pop();
			prefix = "hsl(";
		}
		return prefix + hsla.join() + ")";
	},
	toHexString: function( includeAlpha ) {
		var rgba = this._rgba.slice(),
			alpha = rgba.pop();

		if ( includeAlpha ) {
			rgba.push( ~~( alpha * 255 ) );
		}

		return "#" + jQuery.map( rgba, function( v ) {

			// default to 0 when nulls exist
			v = ( v || 0 ).toString( 16 );
			return v.length === 1 ? "0" + v : v;
		}).join("");
	},
	toString: function() {
		return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
	}
});
color.fn.parse.prototype = color.fn;

// hsla conversions adapted from:
// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

function hue2rgb( p, q, h ) {
	h = ( h + 1 ) % 1;
	if ( h * 6 < 1 ) {
		return p + ( q - p ) * h * 6;
	}
	if ( h * 2 < 1) {
		return q;
	}
	if ( h * 3 < 2 ) {
		return p + ( q - p ) * ( ( 2 / 3 ) - h ) * 6;
	}
	return p;
}

spaces.hsla.to = function( rgba ) {
	if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
		return [ null, null, null, rgba[ 3 ] ];
	}
	var r = rgba[ 0 ] / 255,
		g = rgba[ 1 ] / 255,
		b = rgba[ 2 ] / 255,
		a = rgba[ 3 ],
		max = Math.max( r, g, b ),
		min = Math.min( r, g, b ),
		diff = max - min,
		add = max + min,
		l = add * 0.5,
		h, s;

	if ( min === max ) {
		h = 0;
	} else if ( r === max ) {
		h = ( 60 * ( g - b ) / diff ) + 360;
	} else if ( g === max ) {
		h = ( 60 * ( b - r ) / diff ) + 120;
	} else {
		h = ( 60 * ( r - g ) / diff ) + 240;
	}

	// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
	// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
	if ( diff === 0 ) {
		s = 0;
	} else if ( l <= 0.5 ) {
		s = diff / add;
	} else {
		s = diff / ( 2 - add );
	}
	return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
};

spaces.hsla.from = function( hsla ) {
	if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
		return [ null, null, null, hsla[ 3 ] ];
	}
	var h = hsla[ 0 ] / 360,
		s = hsla[ 1 ],
		l = hsla[ 2 ],
		a = hsla[ 3 ],
		q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
		p = 2 * l - q;

	return [
		Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
		Math.round( hue2rgb( p, q, h ) * 255 ),
		Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
		a
	];
};

each( spaces, function( spaceName, space ) {
	var props = space.props,
		cache = space.cache,
		to = space.to,
		from = space.from;

	// makes rgba() and hsla()
	color.fn[ spaceName ] = function( value ) {

		// generate a cache for this space if it doesn't exist
		if ( to && !this[ cache ] ) {
			this[ cache ] = to( this._rgba );
		}
		if ( value === undefined ) {
			return this[ cache ].slice();
		}

		var ret,
			type = jQuery.type( value ),
			arr = ( type === "array" || type === "object" ) ? value : arguments,
			local = this[ cache ].slice();

		each( props, function( key, prop ) {
			var val = arr[ type === "object" ? key : prop.idx ];
			if ( val == null ) {
				val = local[ prop.idx ];
			}
			local[ prop.idx ] = clamp( val, prop );
		});

		if ( from ) {
			ret = color( from( local ) );
			ret[ cache ] = local;
			return ret;
		} else {
			return color( local );
		}
	};

	// makes red() green() blue() alpha() hue() saturation() lightness()
	each( props, function( key, prop ) {
		// alpha is included in more than one space
		if ( color.fn[ key ] ) {
			return;
		}
		color.fn[ key ] = function( value ) {
			var vtype = jQuery.type( value ),
				fn = ( key === "alpha" ? ( this._hsla ? "hsla" : "rgba" ) : spaceName ),
				local = this[ fn ](),
				cur = local[ prop.idx ],
				match;

			if ( vtype === "undefined" ) {
				return cur;
			}

			if ( vtype === "function" ) {
				value = value.call( this, cur );
				vtype = jQuery.type( value );
			}
			if ( value == null && prop.empty ) {
				return this;
			}
			if ( vtype === "string" ) {
				match = rplusequals.exec( value );
				if ( match ) {
					value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
				}
			}
			local[ prop.idx ] = value;
			return this[ fn ]( local );
		};
	});
});

// add cssHook and .fx.step function for each named hook.
// accept a space separated string of properties
color.hook = function( hook ) {
	var hooks = hook.split( " " );
	each( hooks, function( i, hook ) {
		jQuery.cssHooks[ hook ] = {
			set: function( elem, value ) {
				var parsed, curElem,
					backgroundColor = "";

				if ( value !== "transparent" && ( jQuery.type( value ) !== "string" || ( parsed = stringParse( value ) ) ) ) {
					value = color( parsed || value );
					if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
						curElem = hook === "backgroundColor" ? elem.parentNode : elem;
						while (
							(backgroundColor === "" || backgroundColor === "transparent") &&
							curElem && curElem.style
						) {
							try {
								backgroundColor = jQuery.css( curElem, "backgroundColor" );
								curElem = curElem.parentNode;
							} catch ( e ) {
							}
						}

						value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
							backgroundColor :
							"_default" );
					}

					value = value.toRgbaString();
				}
				try {
					elem.style[ hook ] = value;
				} catch ( e ) {
					// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
				}
			}
		};
		jQuery.fx.step[ hook ] = function( fx ) {
			if ( !fx.colorInit ) {
				fx.start = color( fx.elem, hook );
				fx.end = color( fx.end );
				fx.colorInit = true;
			}
			jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
		};
	});

};

color.hook( stepHooks );

jQuery.cssHooks.borderColor = {
	expand: function( value ) {
		var expanded = {};

		each( [ "Top", "Right", "Bottom", "Left" ], function( i, part ) {
			expanded[ "border" + part + "Color" ] = value;
		});
		return expanded;
	}
};

// Basic color names only.
// Usage of any of the other color names requires adding yourself or including
// jquery.color.svg-names.js.
colors = jQuery.Color.names = {
	// 4.1. Basic color keywords
	aqua: "#00ffff",
	black: "#000000",
	blue: "#0000ff",
	fuchsia: "#ff00ff",
	gray: "#808080",
	green: "#008000",
	lime: "#00ff00",
	maroon: "#800000",
	navy: "#000080",
	olive: "#808000",
	purple: "#800080",
	red: "#ff0000",
	silver: "#c0c0c0",
	teal: "#008080",
	white: "#ffffff",
	yellow: "#ffff00",

	// 4.2.3. "transparent" color keyword
	transparent: [ null, null, null, 0 ],

	_default: "#ffffff"
};

})( jQuery );

/******************************************************************************/
/****************************** CLASS ANIMATIONS ******************************/
/******************************************************************************/
(function() {

var classAnimationActions = [ "add", "remove", "toggle" ],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	};

$.each([ "borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle" ], function( _, prop ) {
	$.fx.step[ prop ] = function( fx ) {
		if ( fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr ) {
			jQuery.style( fx.elem, prop, fx.end );
			fx.setAttr = true;
		}
	};
});

function getElementStyles( elem ) {
	var key, len,
		style = elem.ownerDocument.defaultView ?
			elem.ownerDocument.defaultView.getComputedStyle( elem, null ) :
			elem.currentStyle,
		styles = {};

	if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
		len = style.length;
		while ( len-- ) {
			key = style[ len ];
			if ( typeof style[ key ] === "string" ) {
				styles[ $.camelCase( key ) ] = style[ key ];
			}
		}
	// support: Opera, IE <9
	} else {
		for ( key in style ) {
			if ( typeof style[ key ] === "string" ) {
				styles[ key ] = style[ key ];
			}
		}
	}

	return styles;
}

function styleDifference( oldStyle, newStyle ) {
	var diff = {},
		name, value;

	for ( name in newStyle ) {
		value = newStyle[ name ];
		if ( oldStyle[ name ] !== value ) {
			if ( !shorthandStyles[ name ] ) {
				if ( $.fx.step[ name ] || !isNaN( parseFloat( value ) ) ) {
					diff[ name ] = value;
				}
			}
		}
	}

	return diff;
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

$.effects.animateClass = function( value, duration, easing, callback ) {
	var o = $.speed( duration, easing, callback );

	return this.queue( function() {
		var animated = $( this ),
			baseClass = animated.attr( "class" ) || "",
			applyClassChange,
			allAnimations = o.children ? animated.find( "*" ).addBack() : animated;

		// map the animated objects to store the original styles.
		allAnimations = allAnimations.map(function() {
			var el = $( this );
			return {
				el: el,
				start: getElementStyles( this )
			};
		});

		// apply class change
		applyClassChange = function() {
			$.each( classAnimationActions, function(i, action) {
				if ( value[ action ] ) {
					animated[ action + "Class" ]( value[ action ] );
				}
			});
		};
		applyClassChange();

		// map all animated objects again - calculate new styles and diff
		allAnimations = allAnimations.map(function() {
			this.end = getElementStyles( this.el[ 0 ] );
			this.diff = styleDifference( this.start, this.end );
			return this;
		});

		// apply original class
		animated.attr( "class", baseClass );

		// map all animated objects again - this time collecting a promise
		allAnimations = allAnimations.map(function() {
			var styleInfo = this,
				dfd = $.Deferred(),
				opts = $.extend({}, o, {
					queue: false,
					complete: function() {
						dfd.resolve( styleInfo );
					}
				});

			this.el.animate( this.diff, opts );
			return dfd.promise();
		});

		// once all animations have completed:
		$.when.apply( $, allAnimations.get() ).done(function() {

			// set the final class
			applyClassChange();

			// for each animated element,
			// clear all css properties that were animated
			$.each( arguments, function() {
				var el = this.el;
				$.each( this.diff, function(key) {
					el.css( key, "" );
				});
			});

			// this is guarnteed to be there if you use jQuery.speed()
			// it also handles dequeuing the next anim...
			o.complete.call( animated[ 0 ] );
		});
	});
};

$.fn.extend({
	addClass: (function( orig ) {
		return function( classNames, speed, easing, callback ) {
			return speed ?
				$.effects.animateClass.call( this,
					{ add: classNames }, speed, easing, callback ) :
				orig.apply( this, arguments );
		};
	})( $.fn.addClass ),

	removeClass: (function( orig ) {
		return function( classNames, speed, easing, callback ) {
			return arguments.length > 1 ?
				$.effects.animateClass.call( this,
					{ remove: classNames }, speed, easing, callback ) :
				orig.apply( this, arguments );
		};
	})( $.fn.removeClass ),

	toggleClass: (function( orig ) {
		return function( classNames, force, speed, easing, callback ) {
			if ( typeof force === "boolean" || force === undefined ) {
				if ( !speed ) {
					// without speed parameter
					return orig.apply( this, arguments );
				} else {
					return $.effects.animateClass.call( this,
						(force ? { add: classNames } : { remove: classNames }),
						speed, easing, callback );
				}
			} else {
				// without force parameter
				return $.effects.animateClass.call( this,
					{ toggle: classNames }, force, speed, easing );
			}
		};
	})( $.fn.toggleClass ),

	switchClass: function( remove, add, speed, easing, callback) {
		return $.effects.animateClass.call( this, {
			add: add,
			remove: remove
		}, speed, easing, callback );
	}
});

})();

/******************************************************************************/
/*********************************** EFFECTS **********************************/
/******************************************************************************/

(function() {

$.extend( $.effects, {
	version: "1.11.4",

	// Saves a set of properties in a data storage
	save: function( element, set ) {
		for ( var i = 0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function( element, set ) {
		var val, i;
		for ( i = 0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				val = element.data( dataSpace + set[ i ] );
				// support: jQuery 1.6.2
				// http://bugs.jquery.com/ticket/9917
				// jQuery 1.6.2 incorrectly returns undefined for any falsy value.
				// We can't differentiate between "" and 0 here, so we just assume
				// empty string since it's likely to be a more common value...
				if ( val === undefined ) {
					val = "";
				}
				element.css( set[ i ], val );
			}
		}
	},

	setMode: function( el, mode ) {
		if (mode === "toggle") {
			mode = el.is( ":hidden" ) ? "show" : "hide";
		}
		return mode;
	},

	// Translates a [top,left] array into a baseline value
	// this should be a little more flexible in the future to handle a string & hash
	getBaseline: function( origin, original ) {
		var y, x;
		switch ( origin[ 0 ] ) {
			case "top": y = 0; break;
			case "middle": y = 0.5; break;
			case "bottom": y = 1; break;
			default: y = origin[ 0 ] / original.height;
		}
		switch ( origin[ 1 ] ) {
			case "left": x = 0; break;
			case "center": x = 0.5; break;
			case "right": x = 1; break;
			default: x = origin[ 1 ] / original.width;
		}
		return {
			x: x,
			y: y
		};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function( element ) {

		// if the element is already wrapped, return it
		if ( element.parent().is( ".ui-effects-wrapper" )) {
			return element.parent();
		}

		// wrap the element
		var props = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				"float": element.css( "float" )
			},
			wrapper = $( "<div></div>" )
				.addClass( "ui-effects-wrapper" )
				.css({
					fontSize: "100%",
					background: "transparent",
					border: "none",
					margin: 0,
					padding: 0
				}),
			// Store the size in case width/height are defined in % - Fixes #5245
			size = {
				width: element.width(),
				height: element.height()
			},
			active = document.activeElement;

		// support: Firefox
		// Firefox incorrectly exposes anonymous content
		// https://bugzilla.mozilla.org/show_bug.cgi?id=561664
		try {
			active.id;
		} catch ( e ) {
			active = document.body;
		}

		element.wrap( wrapper );

		// Fixes #7595 - Elements lose focus when wrapped.
		if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
			$( active ).focus();
		}

		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if ( element.css( "position" ) === "static" ) {
			wrapper.css({ position: "relative" });
			element.css({ position: "relative" });
		} else {
			$.extend( props, {
				position: element.css( "position" ),
				zIndex: element.css( "z-index" )
			});
			$.each([ "top", "left", "bottom", "right" ], function(i, pos) {
				props[ pos ] = element.css( pos );
				if ( isNaN( parseInt( props[ pos ], 10 ) ) ) {
					props[ pos ] = "auto";
				}
			});
			element.css({
				position: "relative",
				top: 0,
				left: 0,
				right: "auto",
				bottom: "auto"
			});
		}
		element.css(size);

		return wrapper.css( props ).show();
	},

	removeWrapper: function( element ) {
		var active = document.activeElement;

		if ( element.parent().is( ".ui-effects-wrapper" ) ) {
			element.parent().replaceWith( element );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}
		}

		return element;
	},

	setTransition: function( element, list, factor, value ) {
		value = value || {};
		$.each( list, function( i, x ) {
			var unit = element.cssUnit( x );
			if ( unit[ 0 ] > 0 ) {
				value[ x ] = unit[ 0 ] * factor + unit[ 1 ];
			}
		});
		return value;
	}
});

// return an effect options object for the given parameters:
function _normalizeArguments( effect, options, speed, callback ) {

	// allow passing all options as the first parameter
	if ( $.isPlainObject( effect ) ) {
		options = effect;
		effect = effect.effect;
	}

	// convert to an object
	effect = { effect: effect };

	// catch (effect, null, ...)
	if ( options == null ) {
		options = {};
	}

	// catch (effect, callback)
	if ( $.isFunction( options ) ) {
		callback = options;
		speed = null;
		options = {};
	}

	// catch (effect, speed, ?)
	if ( typeof options === "number" || $.fx.speeds[ options ] ) {
		callback = speed;
		speed = options;
		options = {};
	}

	// catch (effect, options, callback)
	if ( $.isFunction( speed ) ) {
		callback = speed;
		speed = null;
	}

	// add options to effect
	if ( options ) {
		$.extend( effect, options );
	}

	speed = speed || options.duration;
	effect.duration = $.fx.off ? 0 :
		typeof speed === "number" ? speed :
		speed in $.fx.speeds ? $.fx.speeds[ speed ] :
		$.fx.speeds._default;

	effect.complete = callback || options.complete;

	return effect;
}

function standardAnimationOption( option ) {
	// Valid standard speeds (nothing, number, named speed)
	if ( !option || typeof option === "number" || $.fx.speeds[ option ] ) {
		return true;
	}

	// Invalid strings - treat as "normal" speed
	if ( typeof option === "string" && !$.effects.effect[ option ] ) {
		return true;
	}

	// Complete callback
	if ( $.isFunction( option ) ) {
		return true;
	}

	// Options hash (but not naming an effect)
	if ( typeof option === "object" && !option.effect ) {
		return true;
	}

	// Didn't match any standard API
	return false;
}

$.fn.extend({
	effect: function( /* effect, options, speed, callback */ ) {
		var args = _normalizeArguments.apply( this, arguments ),
			mode = args.mode,
			queue = args.queue,
			effectMethod = $.effects.effect[ args.effect ];

		if ( $.fx.off || !effectMethod ) {
			// delegate to the original method (e.g., .show()) if possible
			if ( mode ) {
				return this[ mode ]( args.duration, args.complete );
			} else {
				return this.each( function() {
					if ( args.complete ) {
						args.complete.call( this );
					}
				});
			}
		}

		function run( next ) {
			var elem = $( this ),
				complete = args.complete,
				mode = args.mode;

			function done() {
				if ( $.isFunction( complete ) ) {
					complete.call( elem[0] );
				}
				if ( $.isFunction( next ) ) {
					next();
				}
			}

			// If the element already has the correct final state, delegate to
			// the core methods so the internal tracking of "olddisplay" works.
			if ( elem.is( ":hidden" ) ? mode === "hide" : mode === "show" ) {
				elem[ mode ]();
				done();
			} else {
				effectMethod.call( elem[0], args, done );
			}
		}

		return queue === false ? this.each( run ) : this.queue( queue || "fx", run );
	},

	show: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "show";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.show ),

	hide: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "hide";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.hide ),

	toggle: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) || typeof option === "boolean" ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "toggle";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.toggle ),

	// helper functions
	cssUnit: function(key) {
		var style = this.css( key ),
			val = [];

		$.each( [ "em", "px", "%", "pt" ], function( i, unit ) {
			if ( style.indexOf( unit ) > 0 ) {
				val = [ parseFloat( style ), unit ];
			}
		});
		return val;
	}
});

})();

/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

(function() {

// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

var baseEasings = {};

$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
	baseEasings[ name ] = function( p ) {
		return Math.pow( p, i + 2 );
	};
});

$.extend( baseEasings, {
	Sine: function( p ) {
		return 1 - Math.cos( p * Math.PI / 2 );
	},
	Circ: function( p ) {
		return 1 - Math.sqrt( 1 - p * p );
	},
	Elastic: function( p ) {
		return p === 0 || p === 1 ? p :
			-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
	},
	Back: function( p ) {
		return p * p * ( 3 * p - 2 );
	},
	Bounce: function( p ) {
		var pow2,
			bounce = 4;

		while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
		return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
	}
});

$.each( baseEasings, function( name, easeIn ) {
	$.easing[ "easeIn" + name ] = easeIn;
	$.easing[ "easeOut" + name ] = function( p ) {
		return 1 - easeIn( 1 - p );
	};
	$.easing[ "easeInOut" + name ] = function( p ) {
		return p < 0.5 ?
			easeIn( p * 2 ) / 2 :
			1 - easeIn( p * -2 + 2 ) / 2;
	};
});

})();

var effect = $.effects;


/*!
 * jQuery UI Effects Blind 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/blind-effect/
 */


var effectBlind = $.effects.effect.blind = function( o, done ) {
	// Create element
	var el = $( this ),
		rvertical = /up|down|vertical/,
		rpositivemotion = /up|left|vertical|horizontal/,
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		direction = o.direction || "up",
		vertical = rvertical.test( direction ),
		ref = vertical ? "height" : "width",
		ref2 = vertical ? "top" : "left",
		motion = rpositivemotion.test( direction ),
		animation = {},
		show = mode === "show",
		wrapper, distance, margin;

	// if already wrapped, the wrapper's properties are my property. #6245
	if ( el.parent().is( ".ui-effects-wrapper" ) ) {
		$.effects.save( el.parent(), props );
	} else {
		$.effects.save( el, props );
	}
	el.show();
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});

	distance = wrapper[ ref ]();
	margin = parseFloat( wrapper.css( ref2 ) ) || 0;

	animation[ ref ] = show ? distance : 0;
	if ( !motion ) {
		el
			.css( vertical ? "bottom" : "right", 0 )
			.css( vertical ? "top" : "left", "auto" )
			.css({ position: "absolute" });

		animation[ ref2 ] = show ? margin : distance + margin;
	}

	// start at 0 if we are showing
	if ( show ) {
		wrapper.css( ref, 0 );
		if ( !motion ) {
			wrapper.css( ref2, margin + distance );
		}
	}

	// Animate
	wrapper.animate( animation, {
		duration: o.duration,
		easing: o.easing,
		queue: false,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};


/*!
 * jQuery UI Effects Bounce 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/bounce-effect/
 */


var effectBounce = $.effects.effect.bounce = function( o, done ) {
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],

		// defaults:
		mode = $.effects.setMode( el, o.mode || "effect" ),
		hide = mode === "hide",
		show = mode === "show",
		direction = o.direction || "up",
		distance = o.distance,
		times = o.times || 5,

		// number of internal animations
		anims = times * 2 + ( show || hide ? 1 : 0 ),
		speed = o.duration / anims,
		easing = o.easing,

		// utility:
		ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
		motion = ( direction === "up" || direction === "left" ),
		i,
		upAnim,
		downAnim,

		// we will need to re-assemble the queue to stack our animations in place
		queue = el.queue(),
		queuelen = queue.length;

	// Avoid touching opacity to prevent clearType and PNG issues in IE
	if ( show || hide ) {
		props.push( "opacity" );
	}

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el ); // Create Wrapper

	// default distance for the BIGGEST bounce is the outer Distance / 3
	if ( !distance ) {
		distance = el[ ref === "top" ? "outerHeight" : "outerWidth" ]() / 3;
	}

	if ( show ) {
		downAnim = { opacity: 1 };
		downAnim[ ref ] = 0;

		// if we are showing, force opacity 0 and set the initial position
		// then do the "first" animation
		el.css( "opacity", 0 )
			.css( ref, motion ? -distance * 2 : distance * 2 )
			.animate( downAnim, speed, easing );
	}

	// start at the smallest distance if we are hiding
	if ( hide ) {
		distance = distance / Math.pow( 2, times - 1 );
	}

	downAnim = {};
	downAnim[ ref ] = 0;
	// Bounces up/down/left/right then back to 0 -- times * 2 animations happen here
	for ( i = 0; i < times; i++ ) {
		upAnim = {};
		upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

		el.animate( upAnim, speed, easing )
			.animate( downAnim, speed, easing );

		distance = hide ? distance * 2 : distance / 2;
	}

	// Last Bounce when Hiding
	if ( hide ) {
		upAnim = { opacity: 0 };
		upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

		el.animate( upAnim, speed, easing );
	}

	el.queue(function() {
		if ( hide ) {
			el.hide();
		}
		$.effects.restore( el, props );
		$.effects.removeWrapper( el );
		done();
	});

	// inject all the animations we just queued to be first in line (after "inprogress")
	if ( queuelen > 1) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	el.dequeue();

};


/*!
 * jQuery UI Effects Clip 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/clip-effect/
 */


var effectClip = $.effects.effect.clip = function( o, done ) {
	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		direction = o.direction || "vertical",
		vert = direction === "vertical",
		size = vert ? "height" : "width",
		position = vert ? "top" : "left",
		animation = {},
		wrapper, animate, distance;

	// Save & Show
	$.effects.save( el, props );
	el.show();

	// Create Wrapper
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});
	animate = ( el[0].tagName === "IMG" ) ? wrapper : el;
	distance = animate[ size ]();

	// Shift
	if ( show ) {
		animate.css( size, 0 );
		animate.css( position, distance / 2 );
	}

	// Create Animation Object:
	animation[ size ] = show ? distance : 0;
	animation[ position ] = show ? 0 : distance / 2;

	// Animate
	animate.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( !show ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});

};


/*!
 * jQuery UI Effects Drop 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/drop-effect/
 */


var effectDrop = $.effects.effect.drop = function( o, done ) {

	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "opacity", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
		motion = ( direction === "up" || direction === "left" ) ? "pos" : "neg",
		animation = {
			opacity: show ? 1 : 0
		},
		distance;

	// Adjust
	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );

	distance = o.distance || el[ ref === "top" ? "outerHeight" : "outerWidth" ]( true ) / 2;

	if ( show ) {
		el
			.css( "opacity", 0 )
			.css( ref, motion === "pos" ? -distance : distance );
	}

	// Animation
	animation[ ref ] = ( show ?
		( motion === "pos" ? "+=" : "-=" ) :
		( motion === "pos" ? "-=" : "+=" ) ) +
		distance;

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};


/*!
 * jQuery UI Effects Explode 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/explode-effect/
 */


var effectExplode = $.effects.effect.explode = function( o, done ) {

	var rows = o.pieces ? Math.round( Math.sqrt( o.pieces ) ) : 3,
		cells = rows,
		el = $( this ),
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",

		// show and then visibility:hidden the element before calculating offset
		offset = el.show().css( "visibility", "hidden" ).offset(),

		// width and height of a piece
		width = Math.ceil( el.outerWidth() / cells ),
		height = Math.ceil( el.outerHeight() / rows ),
		pieces = [],

		// loop
		i, j, left, top, mx, my;

	// children animate complete:
	function childComplete() {
		pieces.push( this );
		if ( pieces.length === rows * cells ) {
			animComplete();
		}
	}

	// clone the element for each row and cell.
	for ( i = 0; i < rows ; i++ ) { // ===>
		top = offset.top + i * height;
		my = i - ( rows - 1 ) / 2 ;

		for ( j = 0; j < cells ; j++ ) { // |||
			left = offset.left + j * width;
			mx = j - ( cells - 1 ) / 2 ;

			// Create a clone of the now hidden main element that will be absolute positioned
			// within a wrapper div off the -left and -top equal to size of our pieces
			el
				.clone()
				.appendTo( "body" )
				.wrap( "<div></div>" )
				.css({
					position: "absolute",
					visibility: "visible",
					left: -j * width,
					top: -i * height
				})

			// select the wrapper - make it overflow: hidden and absolute positioned based on
			// where the original was located +left and +top equal to the size of pieces
				.parent()
				.addClass( "ui-effects-explode" )
				.css({
					position: "absolute",
					overflow: "hidden",
					width: width,
					height: height,
					left: left + ( show ? mx * width : 0 ),
					top: top + ( show ? my * height : 0 ),
					opacity: show ? 0 : 1
				}).animate({
					left: left + ( show ? 0 : mx * width ),
					top: top + ( show ? 0 : my * height ),
					opacity: show ? 1 : 0
				}, o.duration || 500, o.easing, childComplete );
		}
	}

	function animComplete() {
		el.css({
			visibility: "visible"
		});
		$( pieces ).remove();
		if ( !show ) {
			el.hide();
		}
		done();
	}
};


/*!
 * jQuery UI Effects Fade 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fade-effect/
 */


var effectFade = $.effects.effect.fade = function( o, done ) {
	var el = $( this ),
		mode = $.effects.setMode( el, o.mode || "toggle" );

	el.animate({
		opacity: mode
	}, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: done
	});
};


/*!
 * jQuery UI Effects Fold 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fold-effect/
 */


var effectFold = $.effects.effect.fold = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		hide = mode === "hide",
		size = o.size || 15,
		percent = /([0-9]+)%/.exec( size ),
		horizFirst = !!o.horizFirst,
		widthFirst = show !== horizFirst,
		ref = widthFirst ? [ "width", "height" ] : [ "height", "width" ],
		duration = o.duration / 2,
		wrapper, distance,
		animation1 = {},
		animation2 = {};

	$.effects.save( el, props );
	el.show();

	// Create Wrapper
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});
	distance = widthFirst ?
		[ wrapper.width(), wrapper.height() ] :
		[ wrapper.height(), wrapper.width() ];

	if ( percent ) {
		size = parseInt( percent[ 1 ], 10 ) / 100 * distance[ hide ? 0 : 1 ];
	}
	if ( show ) {
		wrapper.css( horizFirst ? {
			height: 0,
			width: size
		} : {
			height: size,
			width: 0
		});
	}

	// Animation
	animation1[ ref[ 0 ] ] = show ? distance[ 0 ] : size;
	animation2[ ref[ 1 ] ] = show ? distance[ 1 ] : 0;

	// Animate
	wrapper
		.animate( animation1, duration, o.easing )
		.animate( animation2, duration, o.easing, function() {
			if ( hide ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		});

};


/*!
 * jQuery UI Effects Highlight 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/highlight-effect/
 */


var effectHighlight = $.effects.effect.highlight = function( o, done ) {
	var elem = $( this ),
		props = [ "backgroundImage", "backgroundColor", "opacity" ],
		mode = $.effects.setMode( elem, o.mode || "show" ),
		animation = {
			backgroundColor: elem.css( "backgroundColor" )
		};

	if (mode === "hide") {
		animation.opacity = 0;
	}

	$.effects.save( elem, props );

	elem
		.show()
		.css({
			backgroundImage: "none",
			backgroundColor: o.color || "#ffff99"
		})
		.animate( animation, {
			queue: false,
			duration: o.duration,
			easing: o.easing,
			complete: function() {
				if ( mode === "hide" ) {
					elem.hide();
				}
				$.effects.restore( elem, props );
				done();
			}
		});
};


/*!
 * jQuery UI Effects Size 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/size-effect/
 */


var effectSize = $.effects.effect.size = function( o, done ) {

	// Create element
	var original, baseline, factor,
		el = $( this ),
		props0 = [ "position", "top", "bottom", "left", "right", "width", "height", "overflow", "opacity" ],

		// Always restore
		props1 = [ "position", "top", "bottom", "left", "right", "overflow", "opacity" ],

		// Copy for children
		props2 = [ "width", "height", "overflow" ],
		cProps = [ "fontSize" ],
		vProps = [ "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom" ],
		hProps = [ "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight" ],

		// Set options
		mode = $.effects.setMode( el, o.mode || "effect" ),
		restore = o.restore || mode !== "effect",
		scale = o.scale || "both",
		origin = o.origin || [ "middle", "center" ],
		position = el.css( "position" ),
		props = restore ? props0 : props1,
		zero = {
			height: 0,
			width: 0,
			outerHeight: 0,
			outerWidth: 0
		};

	if ( mode === "show" ) {
		el.show();
	}
	original = {
		height: el.height(),
		width: el.width(),
		outerHeight: el.outerHeight(),
		outerWidth: el.outerWidth()
	};

	if ( o.mode === "toggle" && mode === "show" ) {
		el.from = o.to || zero;
		el.to = o.from || original;
	} else {
		el.from = o.from || ( mode === "show" ? zero : original );
		el.to = o.to || ( mode === "hide" ? zero : original );
	}

	// Set scaling factor
	factor = {
		from: {
			y: el.from.height / original.height,
			x: el.from.width / original.width
		},
		to: {
			y: el.to.height / original.height,
			x: el.to.width / original.width
		}
	};

	// Scale the css box
	if ( scale === "box" || scale === "both" ) {

		// Vertical props scaling
		if ( factor.from.y !== factor.to.y ) {
			props = props.concat( vProps );
			el.from = $.effects.setTransition( el, vProps, factor.from.y, el.from );
			el.to = $.effects.setTransition( el, vProps, factor.to.y, el.to );
		}

		// Horizontal props scaling
		if ( factor.from.x !== factor.to.x ) {
			props = props.concat( hProps );
			el.from = $.effects.setTransition( el, hProps, factor.from.x, el.from );
			el.to = $.effects.setTransition( el, hProps, factor.to.x, el.to );
		}
	}

	// Scale the content
	if ( scale === "content" || scale === "both" ) {

		// Vertical props scaling
		if ( factor.from.y !== factor.to.y ) {
			props = props.concat( cProps ).concat( props2 );
			el.from = $.effects.setTransition( el, cProps, factor.from.y, el.from );
			el.to = $.effects.setTransition( el, cProps, factor.to.y, el.to );
		}
	}

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );
	el.css( "overflow", "hidden" ).css( el.from );

	// Adjust
	if (origin) { // Calculate baseline shifts
		baseline = $.effects.getBaseline( origin, original );
		el.from.top = ( original.outerHeight - el.outerHeight() ) * baseline.y;
		el.from.left = ( original.outerWidth - el.outerWidth() ) * baseline.x;
		el.to.top = ( original.outerHeight - el.to.outerHeight ) * baseline.y;
		el.to.left = ( original.outerWidth - el.to.outerWidth ) * baseline.x;
	}
	el.css( el.from ); // set top & left

	// Animate
	if ( scale === "content" || scale === "both" ) { // Scale the children

		// Add margins/font-size
		vProps = vProps.concat([ "marginTop", "marginBottom" ]).concat(cProps);
		hProps = hProps.concat([ "marginLeft", "marginRight" ]);
		props2 = props0.concat(vProps).concat(hProps);

		el.find( "*[width]" ).each( function() {
			var child = $( this ),
				c_original = {
					height: child.height(),
					width: child.width(),
					outerHeight: child.outerHeight(),
					outerWidth: child.outerWidth()
				};
			if (restore) {
				$.effects.save(child, props2);
			}

			child.from = {
				height: c_original.height * factor.from.y,
				width: c_original.width * factor.from.x,
				outerHeight: c_original.outerHeight * factor.from.y,
				outerWidth: c_original.outerWidth * factor.from.x
			};
			child.to = {
				height: c_original.height * factor.to.y,
				width: c_original.width * factor.to.x,
				outerHeight: c_original.height * factor.to.y,
				outerWidth: c_original.width * factor.to.x
			};

			// Vertical props scaling
			if ( factor.from.y !== factor.to.y ) {
				child.from = $.effects.setTransition( child, vProps, factor.from.y, child.from );
				child.to = $.effects.setTransition( child, vProps, factor.to.y, child.to );
			}

			// Horizontal props scaling
			if ( factor.from.x !== factor.to.x ) {
				child.from = $.effects.setTransition( child, hProps, factor.from.x, child.from );
				child.to = $.effects.setTransition( child, hProps, factor.to.x, child.to );
			}

			// Animate children
			child.css( child.from );
			child.animate( child.to, o.duration, o.easing, function() {

				// Restore children
				if ( restore ) {
					$.effects.restore( child, props2 );
				}
			});
		});
	}

	// Animate
	el.animate( el.to, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( el.to.opacity === 0 ) {
				el.css( "opacity", el.from.opacity );
			}
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			if ( !restore ) {

				// we need to calculate our new positioning based on the scaling
				if ( position === "static" ) {
					el.css({
						position: "relative",
						top: el.to.top,
						left: el.to.left
					});
				} else {
					$.each([ "top", "left" ], function( idx, pos ) {
						el.css( pos, function( _, str ) {
							var val = parseInt( str, 10 ),
								toRef = idx ? el.to.left : el.to.top;

							// if original was "auto", recalculate the new value from wrapper
							if ( str === "auto" ) {
								return toRef + "px";
							}

							return val + toRef + "px";
						});
					});
				}
			}

			$.effects.removeWrapper( el );
			done();
		}
	});

};


/*!
 * jQuery UI Effects Scale 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/scale-effect/
 */


var effectScale = $.effects.effect.scale = function( o, done ) {

	// Create element
	var el = $( this ),
		options = $.extend( true, {}, o ),
		mode = $.effects.setMode( el, o.mode || "effect" ),
		percent = parseInt( o.percent, 10 ) ||
			( parseInt( o.percent, 10 ) === 0 ? 0 : ( mode === "hide" ? 0 : 100 ) ),
		direction = o.direction || "both",
		origin = o.origin,
		original = {
			height: el.height(),
			width: el.width(),
			outerHeight: el.outerHeight(),
			outerWidth: el.outerWidth()
		},
		factor = {
			y: direction !== "horizontal" ? (percent / 100) : 1,
			x: direction !== "vertical" ? (percent / 100) : 1
		};

	// We are going to pass this effect to the size effect:
	options.effect = "size";
	options.queue = false;
	options.complete = done;

	// Set default origin and restore for show/hide
	if ( mode !== "effect" ) {
		options.origin = origin || [ "middle", "center" ];
		options.restore = true;
	}

	options.from = o.from || ( mode === "show" ? {
		height: 0,
		width: 0,
		outerHeight: 0,
		outerWidth: 0
	} : original );
	options.to = {
		height: original.height * factor.y,
		width: original.width * factor.x,
		outerHeight: original.outerHeight * factor.y,
		outerWidth: original.outerWidth * factor.x
	};

	// Fade option to support puff
	if ( options.fade ) {
		if ( mode === "show" ) {
			options.from.opacity = 0;
			options.to.opacity = 1;
		}
		if ( mode === "hide" ) {
			options.from.opacity = 1;
			options.to.opacity = 0;
		}
	}

	// Animate
	el.effect( options );

};


/*!
 * jQuery UI Effects Puff 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/puff-effect/
 */


var effectPuff = $.effects.effect.puff = function( o, done ) {
	var elem = $( this ),
		mode = $.effects.setMode( elem, o.mode || "hide" ),
		hide = mode === "hide",
		percent = parseInt( o.percent, 10 ) || 150,
		factor = percent / 100,
		original = {
			height: elem.height(),
			width: elem.width(),
			outerHeight: elem.outerHeight(),
			outerWidth: elem.outerWidth()
		};

	$.extend( o, {
		effect: "scale",
		queue: false,
		fade: true,
		mode: mode,
		complete: done,
		percent: hide ? percent : 100,
		from: hide ?
			original :
			{
				height: original.height * factor,
				width: original.width * factor,
				outerHeight: original.outerHeight * factor,
				outerWidth: original.outerWidth * factor
			}
	});

	elem.effect( o );
};


/*!
 * jQuery UI Effects Pulsate 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/pulsate-effect/
 */


var effectPulsate = $.effects.effect.pulsate = function( o, done ) {
	var elem = $( this ),
		mode = $.effects.setMode( elem, o.mode || "show" ),
		show = mode === "show",
		hide = mode === "hide",
		showhide = ( show || mode === "hide" ),

		// showing or hiding leaves of the "last" animation
		anims = ( ( o.times || 5 ) * 2 ) + ( showhide ? 1 : 0 ),
		duration = o.duration / anims,
		animateTo = 0,
		queue = elem.queue(),
		queuelen = queue.length,
		i;

	if ( show || !elem.is(":visible")) {
		elem.css( "opacity", 0 ).show();
		animateTo = 1;
	}

	// anims - 1 opacity "toggles"
	for ( i = 1; i < anims; i++ ) {
		elem.animate({
			opacity: animateTo
		}, duration, o.easing );
		animateTo = 1 - animateTo;
	}

	elem.animate({
		opacity: animateTo
	}, duration, o.easing);

	elem.queue(function() {
		if ( hide ) {
			elem.hide();
		}
		done();
	});

	// We just queued up "anims" animations, we need to put them next in the queue
	if ( queuelen > 1 ) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	elem.dequeue();
};


/*!
 * jQuery UI Effects Shake 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/shake-effect/
 */


var effectShake = $.effects.effect.shake = function( o, done ) {

	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "effect" ),
		direction = o.direction || "left",
		distance = o.distance || 20,
		times = o.times || 3,
		anims = times * 2 + 1,
		speed = Math.round( o.duration / anims ),
		ref = (direction === "up" || direction === "down") ? "top" : "left",
		positiveMotion = (direction === "up" || direction === "left"),
		animation = {},
		animation1 = {},
		animation2 = {},
		i,

		// we will need to re-assemble the queue to stack our animations in place
		queue = el.queue(),
		queuelen = queue.length;

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );

	// Animation
	animation[ ref ] = ( positiveMotion ? "-=" : "+=" ) + distance;
	animation1[ ref ] = ( positiveMotion ? "+=" : "-=" ) + distance * 2;
	animation2[ ref ] = ( positiveMotion ? "-=" : "+=" ) + distance * 2;

	// Animate
	el.animate( animation, speed, o.easing );

	// Shakes
	for ( i = 1; i < times; i++ ) {
		el.animate( animation1, speed, o.easing ).animate( animation2, speed, o.easing );
	}
	el
		.animate( animation1, speed, o.easing )
		.animate( animation, speed / 2, o.easing )
		.queue(function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		});

	// inject all the animations we just queued to be first in line (after "inprogress")
	if ( queuelen > 1) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	el.dequeue();

};


/*!
 * jQuery UI Effects Slide 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/slide-effect/
 */


var effectSlide = $.effects.effect.slide = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "width", "height" ],
		mode = $.effects.setMode( el, o.mode || "show" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = (direction === "up" || direction === "down") ? "top" : "left",
		positiveMotion = (direction === "up" || direction === "left"),
		distance,
		animation = {};

	// Adjust
	$.effects.save( el, props );
	el.show();
	distance = o.distance || el[ ref === "top" ? "outerHeight" : "outerWidth" ]( true );

	$.effects.createWrapper( el ).css({
		overflow: "hidden"
	});

	if ( show ) {
		el.css( ref, positiveMotion ? (isNaN(distance) ? "-" + distance : -distance) : distance );
	}

	// Animation
	animation[ ref ] = ( show ?
		( positiveMotion ? "+=" : "-=") :
		( positiveMotion ? "-=" : "+=")) +
		distance;

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};


/*!
 * jQuery UI Effects Transfer 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/transfer-effect/
 */


var effectTransfer = $.effects.effect.transfer = function( o, done ) {
	var elem = $( this ),
		target = $( o.to ),
		targetFixed = target.css( "position" ) === "fixed",
		body = $("body"),
		fixTop = targetFixed ? body.scrollTop() : 0,
		fixLeft = targetFixed ? body.scrollLeft() : 0,
		endPosition = target.offset(),
		animation = {
			top: endPosition.top - fixTop,
			left: endPosition.left - fixLeft,
			height: target.innerHeight(),
			width: target.innerWidth()
		},
		startPosition = elem.offset(),
		transfer = $( "<div class='ui-effects-transfer'></div>" )
			.appendTo( document.body )
			.addClass( o.className )
			.css({
				top: startPosition.top - fixTop,
				left: startPosition.left - fixLeft,
				height: elem.innerHeight(),
				width: elem.innerWidth(),
				position: targetFixed ? "fixed" : "absolute"
			})
			.animate( animation, o.duration, o.easing, function() {
				transfer.remove();
				done();
			});
};


/*!
 * jQuery UI Progressbar 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/progressbar/
 */


var progressbar = $.widget( "ui.progressbar", {
	version: "1.11.4",
	options: {
		max: 100,
		value: 0,

		change: null,
		complete: null
	},

	min: 0,

	_create: function() {
		// Constrain initial value
		this.oldValue = this.options.value = this._constrainedValue();

		this.element
			.addClass( "ui-progressbar ui-widget ui-widget-content ui-corner-all" )
			.attr({
				// Only set static values, aria-valuenow and aria-valuemax are
				// set inside _refreshValue()
				role: "progressbar",
				"aria-valuemin": this.min
			});

		this.valueDiv = $( "<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>" )
			.appendTo( this.element );

		this._refreshValue();
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-progressbar ui-widget ui-widget-content ui-corner-all" )
			.removeAttr( "role" )
			.removeAttr( "aria-valuemin" )
			.removeAttr( "aria-valuemax" )
			.removeAttr( "aria-valuenow" );

		this.valueDiv.remove();
	},

	value: function( newValue ) {
		if ( newValue === undefined ) {
			return this.options.value;
		}

		this.options.value = this._constrainedValue( newValue );
		this._refreshValue();
	},

	_constrainedValue: function( newValue ) {
		if ( newValue === undefined ) {
			newValue = this.options.value;
		}

		this.indeterminate = newValue === false;

		// sanitize value
		if ( typeof newValue !== "number" ) {
			newValue = 0;
		}

		return this.indeterminate ? false :
			Math.min( this.options.max, Math.max( this.min, newValue ) );
	},

	_setOptions: function( options ) {
		// Ensure "value" option is set after other values (like max)
		var value = options.value;
		delete options.value;

		this._super( options );

		this.options.value = this._constrainedValue( value );
		this._refreshValue();
	},

	_setOption: function( key, value ) {
		if ( key === "max" ) {
			// Don't allow a max less than min
			value = Math.max( this.min, value );
		}
		if ( key === "disabled" ) {
			this.element
				.toggleClass( "ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
		}
		this._super( key, value );
	},

	_percentage: function() {
		return this.indeterminate ? 100 : 100 * ( this.options.value - this.min ) / ( this.options.max - this.min );
	},

	_refreshValue: function() {
		var value = this.options.value,
			percentage = this._percentage();

		this.valueDiv
			.toggle( this.indeterminate || value > this.min )
			.toggleClass( "ui-corner-right", value === this.options.max )
			.width( percentage.toFixed(0) + "%" );

		this.element.toggleClass( "ui-progressbar-indeterminate", this.indeterminate );

		if ( this.indeterminate ) {
			this.element.removeAttr( "aria-valuenow" );
			if ( !this.overlayDiv ) {
				this.overlayDiv = $( "<div class='ui-progressbar-overlay'></div>" ).appendTo( this.valueDiv );
			}
		} else {
			this.element.attr({
				"aria-valuemax": this.options.max,
				"aria-valuenow": value
			});
			if ( this.overlayDiv ) {
				this.overlayDiv.remove();
				this.overlayDiv = null;
			}
		}

		if ( this.oldValue !== value ) {
			this.oldValue = value;
			this._trigger( "change" );
		}
		if ( value === this.options.max ) {
			this._trigger( "complete" );
		}
	}
});


/*!
 * jQuery UI Selectable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/selectable/
 */


var selectable = $.widget("ui.selectable", $.ui.mouse, {
	version: "1.11.4",
	options: {
		appendTo: "body",
		autoRefresh: true,
		distance: 0,
		filter: "*",
		tolerance: "touch",

		// callbacks
		selected: null,
		selecting: null,
		start: null,
		stop: null,
		unselected: null,
		unselecting: null
	},
	_create: function() {
		var selectees,
			that = this;

		this.element.addClass("ui-selectable");

		this.dragged = false;

		// cache selectee children based on filter
		this.refresh = function() {
			selectees = $(that.options.filter, that.element[0]);
			selectees.addClass("ui-selectee");
			selectees.each(function() {
				var $this = $(this),
					pos = $this.offset();
				$.data(this, "selectable-item", {
					element: this,
					$element: $this,
					left: pos.left,
					top: pos.top,
					right: pos.left + $this.outerWidth(),
					bottom: pos.top + $this.outerHeight(),
					startselected: false,
					selected: $this.hasClass("ui-selected"),
					selecting: $this.hasClass("ui-selecting"),
					unselecting: $this.hasClass("ui-unselecting")
				});
			});
		};
		this.refresh();

		this.selectees = selectees.addClass("ui-selectee");

		this._mouseInit();

		this.helper = $("<div class='ui-selectable-helper'></div>");
	},

	_destroy: function() {
		this.selectees
			.removeClass("ui-selectee")
			.removeData("selectable-item");
		this.element
			.removeClass("ui-selectable ui-selectable-disabled");
		this._mouseDestroy();
	},

	_mouseStart: function(event) {
		var that = this,
			options = this.options;

		this.opos = [ event.pageX, event.pageY ];

		if (this.options.disabled) {
			return;
		}

		this.selectees = $(options.filter, this.element[0]);

		this._trigger("start", event);

		$(options.appendTo).append(this.helper);
		// position helper (lasso)
		this.helper.css({
			"left": event.pageX,
			"top": event.pageY,
			"width": 0,
			"height": 0
		});

		if (options.autoRefresh) {
			this.refresh();
		}

		this.selectees.filter(".ui-selected").each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.startselected = true;
			if (!event.metaKey && !event.ctrlKey) {
				selectee.$element.removeClass("ui-selected");
				selectee.selected = false;
				selectee.$element.addClass("ui-unselecting");
				selectee.unselecting = true;
				// selectable UNSELECTING callback
				that._trigger("unselecting", event, {
					unselecting: selectee.element
				});
			}
		});

		$(event.target).parents().addBack().each(function() {
			var doSelect,
				selectee = $.data(this, "selectable-item");
			if (selectee) {
				doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass("ui-selected");
				selectee.$element
					.removeClass(doSelect ? "ui-unselecting" : "ui-selected")
					.addClass(doSelect ? "ui-selecting" : "ui-unselecting");
				selectee.unselecting = !doSelect;
				selectee.selecting = doSelect;
				selectee.selected = doSelect;
				// selectable (UN)SELECTING callback
				if (doSelect) {
					that._trigger("selecting", event, {
						selecting: selectee.element
					});
				} else {
					that._trigger("unselecting", event, {
						unselecting: selectee.element
					});
				}
				return false;
			}
		});

	},

	_mouseDrag: function(event) {

		this.dragged = true;

		if (this.options.disabled) {
			return;
		}

		var tmp,
			that = this,
			options = this.options,
			x1 = this.opos[0],
			y1 = this.opos[1],
			x2 = event.pageX,
			y2 = event.pageY;

		if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
		if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
		this.helper.css({ left: x1, top: y1, width: x2 - x1, height: y2 - y1 });

		this.selectees.each(function() {
			var selectee = $.data(this, "selectable-item"),
				hit = false;

			//prevent helper from being selected if appendTo: selectable
			if (!selectee || selectee.element === that.element[0]) {
				return;
			}

			if (options.tolerance === "touch") {
				hit = ( !(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1) );
			} else if (options.tolerance === "fit") {
				hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
			}

			if (hit) {
				// SELECT
				if (selectee.selected) {
					selectee.$element.removeClass("ui-selected");
					selectee.selected = false;
				}
				if (selectee.unselecting) {
					selectee.$element.removeClass("ui-unselecting");
					selectee.unselecting = false;
				}
				if (!selectee.selecting) {
					selectee.$element.addClass("ui-selecting");
					selectee.selecting = true;
					// selectable SELECTING callback
					that._trigger("selecting", event, {
						selecting: selectee.element
					});
				}
			} else {
				// UNSELECT
				if (selectee.selecting) {
					if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
						selectee.$element.removeClass("ui-selecting");
						selectee.selecting = false;
						selectee.$element.addClass("ui-selected");
						selectee.selected = true;
					} else {
						selectee.$element.removeClass("ui-selecting");
						selectee.selecting = false;
						if (selectee.startselected) {
							selectee.$element.addClass("ui-unselecting");
							selectee.unselecting = true;
						}
						// selectable UNSELECTING callback
						that._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
				if (selectee.selected) {
					if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
						selectee.$element.removeClass("ui-selected");
						selectee.selected = false;

						selectee.$element.addClass("ui-unselecting");
						selectee.unselecting = true;
						// selectable UNSELECTING callback
						that._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
			}
		});

		return false;
	},

	_mouseStop: function(event) {
		var that = this;

		this.dragged = false;

		$(".ui-unselecting", this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass("ui-unselecting");
			selectee.unselecting = false;
			selectee.startselected = false;
			that._trigger("unselected", event, {
				unselected: selectee.element
			});
		});
		$(".ui-selecting", this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass("ui-selecting").addClass("ui-selected");
			selectee.selecting = false;
			selectee.selected = true;
			selectee.startselected = true;
			that._trigger("selected", event, {
				selected: selectee.element
			});
		});
		this._trigger("stop", event);

		this.helper.remove();

		return false;
	}

});


/*!
 * jQuery UI Selectmenu 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/selectmenu
 */


var selectmenu = $.widget( "ui.selectmenu", {
	version: "1.11.4",
	defaultElement: "<select>",
	options: {
		appendTo: null,
		disabled: null,
		icons: {
			button: "ui-icon-triangle-1-s"
		},
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		width: null,

		// callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		select: null
	},

	_create: function() {
		var selectmenuId = this.element.uniqueId().attr( "id" );
		this.ids = {
			element: selectmenuId,
			button: selectmenuId + "-button",
			menu: selectmenuId + "-menu"
		};

		this._drawButton();
		this._drawMenu();

		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_drawButton: function() {
		var that = this;

		// Associate existing label with the new button
		this.label = $( "label[for='" + this.ids.element + "']" ).attr( "for", this.ids.button );
		this._on( this.label, {
			click: function( event ) {
				this.button.focus();
				event.preventDefault();
			}
		});

		// Hide original select element
		this.element.hide();

		// Create button
		this.button = $( "<span>", {
			"class": "ui-selectmenu-button ui-widget ui-state-default ui-corner-all",
			tabindex: this.options.disabled ? -1 : 0,
			id: this.ids.button,
			role: "combobox",
			"aria-expanded": "false",
			"aria-autocomplete": "list",
			"aria-owns": this.ids.menu,
			"aria-haspopup": "true"
		})
			.insertAfter( this.element );

		$( "<span>", {
			"class": "ui-icon " + this.options.icons.button
		})
			.prependTo( this.button );

		this.buttonText = $( "<span>", {
			"class": "ui-selectmenu-text"
		})
			.appendTo( this.button );

		this._setText( this.buttonText, this.element.find( "option:selected" ).text() );
		this._resizeButton();

		this._on( this.button, this._buttonEvents );
		this.button.one( "focusin", function() {

			// Delay rendering the menu items until the button receives focus.
			// The menu may have already been rendered via a programmatic open.
			if ( !that.menuItems ) {
				that._refreshMenu();
			}
		});
		this._hoverable( this.button );
		this._focusable( this.button );
	},

	_drawMenu: function() {
		var that = this;

		// Create menu
		this.menu = $( "<ul>", {
			"aria-hidden": "true",
			"aria-labelledby": this.ids.button,
			id: this.ids.menu
		});

		// Wrap menu
		this.menuWrap = $( "<div>", {
			"class": "ui-selectmenu-menu ui-front"
		})
			.append( this.menu )
			.appendTo( this._appendTo() );

		// Initialize menu widget
		this.menuInstance = this.menu
			.menu({
				role: "listbox",
				select: function( event, ui ) {
					event.preventDefault();

					// support: IE8
					// If the item was selected via a click, the text selection
					// will be destroyed in IE
					that._setSelection();

					that._select( ui.item.data( "ui-selectmenu-item" ), event );
				},
				focus: function( event, ui ) {
					var item = ui.item.data( "ui-selectmenu-item" );

					// Prevent inital focus from firing and check if its a newly focused item
					if ( that.focusIndex != null && item.index !== that.focusIndex ) {
						that._trigger( "focus", event, { item: item } );
						if ( !that.isOpen ) {
							that._select( item, event );
						}
					}
					that.focusIndex = item.index;

					that.button.attr( "aria-activedescendant",
						that.menuItems.eq( item.index ).attr( "id" ) );
				}
			})
			.menu( "instance" );

		// Adjust menu styles to dropdown
		this.menu
			.addClass( "ui-corner-bottom" )
			.removeClass( "ui-corner-all" );

		// Don't close the menu on mouseleave
		this.menuInstance._off( this.menu, "mouseleave" );

		// Cancel the menu's collapseAll on document click
		this.menuInstance._closeOnDocumentClick = function() {
			return false;
		};

		// Selects often contain empty items, but never contain dividers
		this.menuInstance._isDivider = function() {
			return false;
		};
	},

	refresh: function() {
		this._refreshMenu();
		this._setText( this.buttonText, this._getSelectedItem().text() );
		if ( !this.options.width ) {
			this._resizeButton();
		}
	},

	_refreshMenu: function() {
		this.menu.empty();

		var item,
			options = this.element.find( "option" );

		if ( !options.length ) {
			return;
		}

		this._parseOptions( options );
		this._renderMenu( this.menu, this.items );

		this.menuInstance.refresh();
		this.menuItems = this.menu.find( "li" ).not( ".ui-selectmenu-optgroup" );

		item = this._getSelectedItem();

		// Update the menu to have the correct item focused
		this.menuInstance.focus( null, item );
		this._setAria( item.data( "ui-selectmenu-item" ) );

		// Set disabled state
		this._setOption( "disabled", this.element.prop( "disabled" ) );
	},

	open: function( event ) {
		if ( this.options.disabled ) {
			return;
		}

		// If this is the first time the menu is being opened, render the items
		if ( !this.menuItems ) {
			this._refreshMenu();
		} else {

			// Menu clears focus on close, reset focus to selected item
			this.menu.find( ".ui-state-focus" ).removeClass( "ui-state-focus" );
			this.menuInstance.focus( null, this._getSelectedItem() );
		}

		this.isOpen = true;
		this._toggleAttr();
		this._resizeMenu();
		this._position();

		this._on( this.document, this._documentClick );

		this._trigger( "open", event );
	},

	_position: function() {
		this.menuWrap.position( $.extend( { of: this.button }, this.options.position ) );
	},

	close: function( event ) {
		if ( !this.isOpen ) {
			return;
		}

		this.isOpen = false;
		this._toggleAttr();

		this.range = null;
		this._off( this.document );

		this._trigger( "close", event );
	},

	widget: function() {
		return this.button;
	},

	menuWidget: function() {
		return this.menu;
	},

	_renderMenu: function( ul, items ) {
		var that = this,
			currentOptgroup = "";

		$.each( items, function( index, item ) {
			if ( item.optgroup !== currentOptgroup ) {
				$( "<li>", {
					"class": "ui-selectmenu-optgroup ui-menu-divider" +
						( item.element.parent( "optgroup" ).prop( "disabled" ) ?
							" ui-state-disabled" :
							"" ),
					text: item.optgroup
				})
					.appendTo( ul );

				currentOptgroup = item.optgroup;
			}

			that._renderItemData( ul, item );
		});
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-selectmenu-item", item );
	},

	_renderItem: function( ul, item ) {
		var li = $( "<li>" );

		if ( item.disabled ) {
			li.addClass( "ui-state-disabled" );
		}
		this._setText( li, item.label );

		return li.appendTo( ul );
	},

	_setText: function( element, value ) {
		if ( value ) {
			element.text( value );
		} else {
			element.html( "&#160;" );
		}
	},

	_move: function( direction, event ) {
		var item, next,
			filter = ".ui-menu-item";

		if ( this.isOpen ) {
			item = this.menuItems.eq( this.focusIndex );
		} else {
			item = this.menuItems.eq( this.element[ 0 ].selectedIndex );
			filter += ":not(.ui-state-disabled)";
		}

		if ( direction === "first" || direction === "last" ) {
			next = item[ direction === "first" ? "prevAll" : "nextAll" ]( filter ).eq( -1 );
		} else {
			next = item[ direction + "All" ]( filter ).eq( 0 );
		}

		if ( next.length ) {
			this.menuInstance.focus( event, next );
		}
	},

	_getSelectedItem: function() {
		return this.menuItems.eq( this.element[ 0 ].selectedIndex );
	},

	_toggle: function( event ) {
		this[ this.isOpen ? "close" : "open" ]( event );
	},

	_setSelection: function() {
		var selection;

		if ( !this.range ) {
			return;
		}

		if ( window.getSelection ) {
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange( this.range );

		// support: IE8
		} else {
			this.range.select();
		}

		// support: IE
		// Setting the text selection kills the button focus in IE, but
		// restoring the focus doesn't kill the selection.
		this.button.focus();
	},

	_documentClick: {
		mousedown: function( event ) {
			if ( !this.isOpen ) {
				return;
			}

			if ( !$( event.target ).closest( ".ui-selectmenu-menu, #" + this.ids.button ).length ) {
				this.close( event );
			}
		}
	},

	_buttonEvents: {

		// Prevent text selection from being reset when interacting with the selectmenu (#10144)
		mousedown: function() {
			var selection;

			if ( window.getSelection ) {
				selection = window.getSelection();
				if ( selection.rangeCount ) {
					this.range = selection.getRangeAt( 0 );
				}

			// support: IE8
			} else {
				this.range = document.selection.createRange();
			}
		},

		click: function( event ) {
			this._setSelection();
			this._toggle( event );
		},

		keydown: function( event ) {
			var preventDefault = true;
			switch ( event.keyCode ) {
				case $.ui.keyCode.TAB:
				case $.ui.keyCode.ESCAPE:
					this.close( event );
					preventDefault = false;
					break;
				case $.ui.keyCode.ENTER:
					if ( this.isOpen ) {
						this._selectFocusedItem( event );
					}
					break;
				case $.ui.keyCode.UP:
					if ( event.altKey ) {
						this._toggle( event );
					} else {
						this._move( "prev", event );
					}
					break;
				case $.ui.keyCode.DOWN:
					if ( event.altKey ) {
						this._toggle( event );
					} else {
						this._move( "next", event );
					}
					break;
				case $.ui.keyCode.SPACE:
					if ( this.isOpen ) {
						this._selectFocusedItem( event );
					} else {
						this._toggle( event );
					}
					break;
				case $.ui.keyCode.LEFT:
					this._move( "prev", event );
					break;
				case $.ui.keyCode.RIGHT:
					this._move( "next", event );
					break;
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.PAGE_UP:
					this._move( "first", event );
					break;
				case $.ui.keyCode.END:
				case $.ui.keyCode.PAGE_DOWN:
					this._move( "last", event );
					break;
				default:
					this.menu.trigger( event );
					preventDefault = false;
			}

			if ( preventDefault ) {
				event.preventDefault();
			}
		}
	},

	_selectFocusedItem: function( event ) {
		var item = this.menuItems.eq( this.focusIndex );
		if ( !item.hasClass( "ui-state-disabled" ) ) {
			this._select( item.data( "ui-selectmenu-item" ), event );
		}
	},

	_select: function( item, event ) {
		var oldIndex = this.element[ 0 ].selectedIndex;

		// Change native select element
		this.element[ 0 ].selectedIndex = item.index;
		this._setText( this.buttonText, item.label );
		this._setAria( item );
		this._trigger( "select", event, { item: item } );

		if ( item.index !== oldIndex ) {
			this._trigger( "change", event, { item: item } );
		}

		this.close( event );
	},

	_setAria: function( item ) {
		var id = this.menuItems.eq( item.index ).attr( "id" );

		this.button.attr({
			"aria-labelledby": id,
			"aria-activedescendant": id
		});
		this.menu.attr( "aria-activedescendant", id );
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			this.button.find( "span.ui-icon" )
				.removeClass( this.options.icons.button )
				.addClass( value.button );
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.menuWrap.appendTo( this._appendTo() );
		}

		if ( key === "disabled" ) {
			this.menuInstance.option( "disabled", value );
			this.button
				.toggleClass( "ui-state-disabled", value )
				.attr( "aria-disabled", value );

			this.element.prop( "disabled", value );
			if ( value ) {
				this.button.attr( "tabindex", -1 );
				this.close();
			} else {
				this.button.attr( "tabindex", 0 );
			}
		}

		if ( key === "width" ) {
			this._resizeButton();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_toggleAttr: function() {
		this.button
			.toggleClass( "ui-corner-top", this.isOpen )
			.toggleClass( "ui-corner-all", !this.isOpen )
			.attr( "aria-expanded", this.isOpen );
		this.menuWrap.toggleClass( "ui-selectmenu-open", this.isOpen );
		this.menu.attr( "aria-hidden", !this.isOpen );
	},

	_resizeButton: function() {
		var width = this.options.width;

		if ( !width ) {
			width = this.element.show().outerWidth();
			this.element.hide();
		}

		this.button.outerWidth( width );
	},

	_resizeMenu: function() {
		this.menu.outerWidth( Math.max(
			this.button.outerWidth(),

			// support: IE10
			// IE10 wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping
			this.menu.width( "" ).outerWidth() + 1
		) );
	},

	_getCreateOptions: function() {
		return { disabled: this.element.prop( "disabled" ) };
	},

	_parseOptions: function( options ) {
		var data = [];
		options.each(function( index, item ) {
			var option = $( item ),
				optgroup = option.parent( "optgroup" );
			data.push({
				element: option,
				index: index,
				value: option.val(),
				label: option.text(),
				optgroup: optgroup.attr( "label" ) || "",
				disabled: optgroup.prop( "disabled" ) || option.prop( "disabled" )
			});
		});
		this.items = data;
	},

	_destroy: function() {
		this.menuWrap.remove();
		this.button.remove();
		this.element.show();
		this.element.removeUniqueId();
		this.label.attr( "for", this.ids.element );
	}
});


/*!
 * jQuery UI Slider 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/slider/
 */


var slider = $.widget( "ui.slider", $.ui.mouse, {
	version: "1.11.4",
	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null,

		// callbacks
		change: null,
		slide: null,
		start: null,
		stop: null
	},

	// number of pages in a slider
	// (how many times can you page up/down to go through the whole range)
	numPages: 5,

	_create: function() {
		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();
		this._calculateNewMax();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all");

		this._refresh();
		this._setOption( "disabled", this.options.disabled );

		this._animateOff = false;
	},

	_refresh: function() {
		this._createRange();
		this._createHandles();
		this._setupEvents();
		this._refreshValue();
	},

	_createHandles: function() {
		var i, handleCount,
			options = this.options,
			existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
			handle = "<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",
			handles = [];

		handleCount = ( options.values && options.values.length ) || 1;

		if ( existingHandles.length > handleCount ) {
			existingHandles.slice( handleCount ).remove();
			existingHandles = existingHandles.slice( 0, handleCount );
		}

		for ( i = existingHandles.length; i < handleCount; i++ ) {
			handles.push( handle );
		}

		this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( this.element ) );

		this.handle = this.handles.eq( 0 );

		this.handles.each(function( i ) {
			$( this ).data( "ui-slider-handle-index", i );
		});
	},

	_createRange: function() {
		var options = this.options,
			classes = "";

		if ( options.range ) {
			if ( options.range === true ) {
				if ( !options.values ) {
					options.values = [ this._valueMin(), this._valueMin() ];
				} else if ( options.values.length && options.values.length !== 2 ) {
					options.values = [ options.values[0], options.values[0] ];
				} else if ( $.isArray( options.values ) ) {
					options.values = options.values.slice(0);
				}
			}

			if ( !this.range || !this.range.length ) {
				this.range = $( "<div></div>" )
					.appendTo( this.element );

				classes = "ui-slider-range" +
				// note: this isn't the most fittingly semantic framework class for this element,
				// but worked best visually with a variety of themes
				" ui-widget-header ui-corner-all";
			} else {
				this.range.removeClass( "ui-slider-range-min ui-slider-range-max" )
					// Handle range switching from true to min/max
					.css({
						"left": "",
						"bottom": ""
					});
			}

			this.range.addClass( classes +
				( ( options.range === "min" || options.range === "max" ) ? " ui-slider-range-" + options.range : "" ) );
		} else {
			if ( this.range ) {
				this.range.remove();
			}
			this.range = null;
		}
	},

	_setupEvents: function() {
		this._off( this.handles );
		this._on( this.handles, this._handleEvents );
		this._hoverable( this.handles );
		this._focusable( this.handles );
	},

	_destroy: function() {
		this.handles.remove();
		if ( this.range ) {
			this.range.remove();
		}

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );

		this._mouseDestroy();
	},

	_mouseCapture: function( event ) {
		var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle,
			that = this,
			o = this.options;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - that.values(i) );
			if (( distance > thisDistance ) ||
				( distance === thisDistance &&
					(i === that._lastChangedValue || that.values(i) === o.min ))) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		this._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();

		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().addBack().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		if ( !this.handles.hasClass( "ui-state-hover" ) ) {
			this._slide( event, index, normValue );
		}
		this._animateOff = true;
		return true;
	},

	_mouseStart: function() {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );

		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},

	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) &&
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			//store the last changed value index for reference when handles overlap
			this._lastChangedValue = index;

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
			return;
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
			return;
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( key === "range" && this.options.range === true ) {
			if ( value === "min" ) {
				this.options.value = this._values( 0 );
				this.options.values = null;
			} else if ( value === "max" ) {
				this.options.value = this._values( this.options.values.length - 1 );
				this.options.values = null;
			}
		}

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		if ( key === "disabled" ) {
			this.element.toggleClass( "ui-state-disabled", !!value );
		}

		this._super( key, value );

		switch ( key ) {
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();

				// Reset positioning from previous orientation
				this.handles.css( value === "horizontal" ? "bottom" : "left", "" );
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
			case "step":
			case "min":
			case "max":
				this._animateOff = true;
				this._calculateNewMax();
				this._refreshValue();
				this._animateOff = false;
				break;
			case "range":
				this._animateOff = true;
				this._refresh();
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else if ( this.options.values && this.options.values.length ) {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i += 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		} else {
			return [];
		}
	},

	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val <= this._valueMin() ) {
			return this._valueMin();
		}
		if ( val >= this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = (val - this._valueMin()) % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_calculateNewMax: function() {
		var max = this.options.max,
			min = this._valueMin(),
			step = this.options.step,
			aboveMin = Math.floor( ( +( max - min ).toFixed( this._precision() ) ) / step ) * step;
		max = aboveMin + min;
		this.max = parseFloat( max.toFixed( this._precision() ) );
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.max;
	},

	_refreshValue: function() {
		var lastValPercent, valPercent, value, valueMin, valueMax,
			oRange = this.options.range,
			o = this.options,
			that = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			_set = {};

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i ) {
				valPercent = ( that.values(i) - that._valueMin() ) / ( that._valueMax() - that._valueMin() ) * 100;
				_set[ that.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( that.options.range === true ) {
					if ( that.orientation === "horizontal" ) {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ this.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	},

	_handleEvents: {
		keydown: function( event ) {
			var allowed, curVal, newVal, step,
				index = $( event.target ).data( "ui-slider-handle-index" );

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.END:
				case $.ui.keyCode.PAGE_UP:
				case $.ui.keyCode.PAGE_DOWN:
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					event.preventDefault();
					if ( !this._keySliding ) {
						this._keySliding = true;
						$( event.target ).addClass( "ui-state-active" );
						allowed = this._start( event, index );
						if ( allowed === false ) {
							return;
						}
					}
					break;
			}

			step = this.options.step;
			if ( this.options.values && this.options.values.length ) {
				curVal = newVal = this.values( index );
			} else {
				curVal = newVal = this.value();
			}

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
					newVal = this._valueMin();
					break;
				case $.ui.keyCode.END:
					newVal = this._valueMax();
					break;
				case $.ui.keyCode.PAGE_UP:
					newVal = this._trimAlignValue(
						curVal + ( ( this._valueMax() - this._valueMin() ) / this.numPages )
					);
					break;
				case $.ui.keyCode.PAGE_DOWN:
					newVal = this._trimAlignValue(
						curVal - ( (this._valueMax() - this._valueMin()) / this.numPages ) );
					break;
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
					if ( curVal === this._valueMax() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal + step );
					break;
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					if ( curVal === this._valueMin() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal - step );
					break;
			}

			this._slide( event, index, newVal );
		},
		keyup: function( event ) {
			var index = $( event.target ).data( "ui-slider-handle-index" );

			if ( this._keySliding ) {
				this._keySliding = false;
				this._stop( event, index );
				this._change( event, index );
				$( event.target ).removeClass( "ui-state-active" );
			}
		}
	}
});


/*!
 * jQuery UI Sortable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/sortable/
 */


var sortable = $.widget("ui.sortable", $.ui.mouse, {
	version: "1.11.4",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: "> *",
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000,

		// callbacks
		activate: null,
		beforeStop: null,
		change: null,
		deactivate: null,
		out: null,
		over: null,
		receive: null,
		remove: null,
		sort: null,
		start: null,
		stop: null,
		update: null
	},

	_isOverAxis: function( x, reference, size ) {
		return ( x >= reference ) && ( x < ( reference + size ) );
	},

	_isFloating: function( item ) {
		return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
	},

	_create: function() {
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		this._setHandleClassName();

		//We're ready to go
		this.ready = true;

	},

	_setOption: function( key, value ) {
		this._super( key, value );

		if ( key === "handle" ) {
			this._setHandleClassName();
		}
	},

	_setHandleClassName: function() {
		this.element.find( ".ui-sortable-handle" ).removeClass( "ui-sortable-handle" );
		$.each( this.items, function() {
			( this.instance.options.handle ?
				this.item.find( this.instance.options.handle ) : this.item )
				.addClass( "ui-sortable-handle" );
		});
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-sortable ui-sortable-disabled" )
			.find( ".ui-sortable-handle" )
				.removeClass( "ui-sortable-handle" );
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- ) {
			this.items[i].item.removeData(this.widgetName + "-item");
		}

		return this;
	},

	_mouseCapture: function(event, overrideHandle) {
		var currentItem = null,
			validHandle = false,
			that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type === "static") {
			return false;
		}

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		$(event.target).parents().each(function() {
			if($.data(this, that.widgetName + "-item") === that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + "-item") === that) {
			currentItem = $(event.target);
		}

		if(!currentItem) {
			return false;
		}
		if(this.options.handle && !overrideHandle) {
			$(this.options.handle, currentItem).find("*").addBack().each(function() {
				if(this === event.target) {
					validHandle = true;
				}
			});
			if(!validHandle) {
				return false;
			}
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var i, body,
			o = this.options;

		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] !== this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment) {
			this._setContainment();
		}

		if( o.cursor && o.cursor !== "auto" ) { // cursor option
			body = this.document.find( "body" );

			// support: IE
			this.storedCursor = body.css( "cursor" );
			body.css( "cursor", o.cursor );

			this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) {
				this._storedOpacity = this.helper.css("opacity");
			}
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) {
				this._storedZIndex = this.helper.css("zIndex");
			}
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
			this.overflowOffset = this.scrollParent.offset();
		}

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions) {
			this._cacheHelperProportions();
		}


		//Post "activate" events to possible containers
		if( !noActivation ) {
			for ( i = this.containers.length - 1; i >= 0; i-- ) {
				this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
			}
		}

		//Prepare possible droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {
		var i, item, itemElement, intersection,
			o = this.options,
			scrolled = false;

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			if(this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
				}

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
				}

			} else {

				if(event.pageY - this.document.scrollTop() < o.scrollSensitivity) {
					scrolled = this.document.scrollTop(this.document.scrollTop() - o.scrollSpeed);
				} else if(this.window.height() - (event.pageY - this.document.scrollTop()) < o.scrollSensitivity) {
					scrolled = this.document.scrollTop(this.document.scrollTop() + o.scrollSpeed);
				}

				if(event.pageX - this.document.scrollLeft() < o.scrollSensitivity) {
					scrolled = this.document.scrollLeft(this.document.scrollLeft() - o.scrollSpeed);
				} else if(this.window.width() - (event.pageX - this.document.scrollLeft()) < o.scrollSensitivity) {
					scrolled = this.document.scrollLeft(this.document.scrollLeft() + o.scrollSpeed);
				}

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
				$.ui.ddmanager.prepareOffsets(this, event);
			}
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}

		//Rearrange
		for (i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			item = this.items[i];
			itemElement = item.item[0];
			intersection = this._intersectsWithPointer(item);
			if (!intersection) {
				continue;
			}

			// Only put the placeholder inside the current Container, skip all
			// items from other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this, moving items in "sub-sortables" can cause
			// the placeholder to jitter between the outer and inner container.
			if (item.instance !== this.currentContainer) {
				continue;
			}

			// cannot intersect with itself
			// no useless actions that have been done before
			// no action if the item moved is the parent of the item checked
			if (itemElement !== this.currentItem[0] &&
				this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
				!$.contains(this.placeholder[0], itemElement) &&
				(this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
			) {

				this.direction = intersection === 1 ? "down" : "up";

				if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		//Call callbacks
		this._trigger("sort", event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) {
			return;
		}

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			$.ui.ddmanager.drop(this, event);
		}

		if(this.options.revert) {
			var that = this,
				cur = this.placeholder.offset(),
				axis = this.options.axis,
				animation = {};

			if ( !axis || axis === "x" ) {
				animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft);
			}
			if ( !axis || axis === "y" ) {
				animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop);
			}
			this.reverting = true;
			$(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper === "original") {
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			} else {
				this.currentItem.show();
			}

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) {
				this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			}
			if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
				this.helper.remove();
			}

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			str = [];
		o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
			if (res) {
				str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
			}
		});

		if(!str.length && o.key) {
			str.push(o.key + "=");
		}

		return str.join("&");

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			ret = [];

		o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height,
			l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height,
			dyClick = this.offset.click.top,
			dxClick = this.offset.click.left,
			isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
			isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
			isOverElement = isOverElementHeight && isOverElementWidth;

		if ( this.options.tolerance === "pointer" ||
			this.options.forcePointerForContainers ||
			(this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) && // Right Half
				x2 - (this.helperProportions.width / 2) < r && // Left Half
				t < y1 + (this.helperProportions.height / 2) && // Bottom Half
				y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === "x") || this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === "y") || this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement) {
			return false;
		}

		return this.floating ?
			( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta !== 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta !== 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this._setHandleClassName();
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var i, j, cur, inst,
			items = [],
			queries = [],
			connectWith = this._connectWith();

		if(connectWith && connected) {
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i], this.document[0]);
				for ( j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
					}
				}
			}
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);

		function addItems() {
			items.push( this );
		}
		for (i = queries.length - 1; i >= 0; i--){
			queries[i][0].each( addItems );
		}

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] === item.item[0]) {
					return false;
				}
			}
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];

		var i, j, cur, inst, targetData, _queries, item, queriesLength,
			items = this.items,
			queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
			connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i], this.document[0]);
				for (j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				}
			}
		}

		for (i = queries.length - 1; i >= 0; i--) {
			targetData = queries[i][1];
			_queries = queries[i][0];

			for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				item = $(_queries[j]);

				item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			}
		}

	},

	refreshPositions: function(fast) {

		// Determine whether items are being displayed horizontally
		this.floating = this.items.length ?
			this.options.axis === "x" || this._isFloating( this.items[ 0 ].item ) :
			false;

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		var i, item, t, p;

		for (i = this.items.length - 1; i >= 0; i--){
			item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
				continue;
			}

			t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			p = t.offset();
			item.left = p.left;
			item.top = p.top;
		}

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (i = this.containers.length - 1; i >= 0; i--){
				p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			}
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var className,
			o = that.options;

		if(!o.placeholder || o.placeholder.constructor === String) {
			className = o.placeholder;
			o.placeholder = {
				element: function() {

					var nodeName = that.currentItem[0].nodeName.toLowerCase(),
						element = $( "<" + nodeName + ">", that.document[0] )
							.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
							.removeClass("ui-sortable-helper");

					if ( nodeName === "tbody" ) {
						that._createTrPlaceholder(
							that.currentItem.find( "tr" ).eq( 0 ),
							$( "<tr>", that.document[ 0 ] ).appendTo( element )
						);
					} else if ( nodeName === "tr" ) {
						that._createTrPlaceholder( that.currentItem, element );
					} else if ( nodeName === "img" ) {
						element.attr( "src", that.currentItem.attr( "src" ) );
					}

					if ( !className ) {
						element.css( "visibility", "hidden" );
					}

					return element;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) {
						return;
					}

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_createTrPlaceholder: function( sourceTr, targetTr ) {
		var that = this;

		sourceTr.children().each(function() {
			$( "<td>&#160;</td>", that.document[ 0 ] )
				.attr( "colspan", $( this ).attr( "colspan" ) || 1 )
				.appendTo( targetTr );
		});
	},

	_contactContainers: function(event) {
		var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, cur, nearBottom, floating, axis,
			innermostContainer = null,
			innermostIndex = null;

		// get innermost container that intersects with item
		for (i = this.containers.length - 1; i >= 0; i--) {

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0])) {
				continue;
			}

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
					continue;
				}

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) {
			return;
		}

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			if (!this.containers[innermostIndex].containerCache.over) {
				this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
				this.containers[innermostIndex].containerCache.over = 1;
			}
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			dist = 10000;
			itemWithLeastDistance = null;
			floating = innermostContainer.floating || this._isFloating(this.currentItem);
			posProperty = floating ? "left" : "top";
			sizeProperty = floating ? "width" : "height";
			axis = floating ? "clientX" : "clientY";

			for (j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
					continue;
				}
				if(this.items[j].item[0] === this.currentItem[0]) {
					continue;
				}

				cur = this.items[j].item.offset()[posProperty];
				nearBottom = false;
				if ( event[ axis ] - cur > this.items[ j ][ sizeProperty ] / 2 ) {
					nearBottom = true;
				}

				if ( Math.abs( event[ axis ] - cur ) < dist ) {
					dist = Math.abs( event[ axis ] - cur );
					itemWithLeastDistance = this.items[ j ];
					this.direction = nearBottom ? "up": "down";
				}
			}

			//Check if dropOnEmpty is enabled
			if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
				return;
			}

			if(this.currentContainer === this.containers[innermostIndex]) {
				if ( !this.currentContainer.containerCache.over ) {
					this.containers[ innermostIndex ]._trigger( "over", event, this._uiHash() );
					this.currentContainer.containerCache.over = 1;
				}
				return;
			}

			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
			this.currentContainer = this.containers[innermostIndex];

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);

		//Add the helper to the DOM if that didn't happen already
		if(!helper.parents("body").length) {
			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
		}

		if(helper[0] === this.currentItem[0]) {
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
		}

		if(!helper[0].style.width || o.forceHelperSize) {
			helper.width(this.currentItem.width());
		}
		if(!helper[0].style.height || o.forceHelperSize) {
			helper.height(this.currentItem.height());
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		// This needs to be actually done for all browsers, since pageX/pageY includes this information
		// with an ugly IE fix
		if( this.offsetParent[0] === this.document[0].body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var ce, co, over,
			o = this.options;
		if(o.containment === "parent") {
			o.containment = this.helper[0].parentNode;
		}
		if(o.containment === "document" || o.containment === "window") {
			this.containment = [
				0 - this.offset.relative.left - this.offset.parent.left,
				0 - this.offset.relative.top - this.offset.parent.top,
				o.containment === "document" ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left,
				(o.containment === "document" ? this.document.width() : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
			];
		}

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			ce = $(o.containment)[0];
			co = $(o.containment).offset();
			over = ($(ce).css("overflow") !== "hidden");

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}
		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
			scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var top, left,
			o = this.options,
			pageX = event.pageX,
			pageY = event.pageY,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition === "relative" && !(this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) {
					pageX = this.containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < this.containment[1]) {
					pageY = this.containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > this.containment[2]) {
					pageX = this.containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > this.containment[3]) {
					pageY = this.containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																// The absolute mouse position
				this.offset.click.top -													// Click offset (relative to the element)
				this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX -																// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter === this.counter) {
				this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
			}
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var i,
			delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) {
			this.placeholder.before(this.currentItem);
		}
		this._noFinalSort = null;

		if(this.helper[0] === this.currentItem[0]) {
			for(i in this._storedCSS) {
				if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
					this._storedCSS[i] = "";
				}
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		}
		if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		}

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		function delayEvent( type, instance, container ) {
			return function( event ) {
				container._trigger( type, event, instance._uiHash( instance ) );
			};
		}
		for (i = this.containers.length - 1; i >= 0; i--){
			if (!noPropagation) {
				delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
			}
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if ( this.storedCursor ) {
			this.document.find( "body" ).css( "cursor", this.storedCursor );
			this.storedStylesheet.remove();
		}
		if(this._storedOpacity) {
			this.helper.css("opacity", this._storedOpacity);
		}
		if(this._storedZIndex) {
			this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
		}

		this.dragging = false;

		if(!noPropagation) {
			this._trigger("beforeStop", event, this._uiHash());
		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if ( !this.cancelHelperRemoval ) {
			if ( this.helper[ 0 ] !== this.currentItem[ 0 ] ) {
				this.helper.remove();
			}
			this.helper = null;
		}

		if(!noPropagation) {
			for (i=0; i < delayedTriggers.length; i++) {
				delayedTriggers[i].call(this, event);
			} //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return !this.cancelHelperRemoval;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});


/*!
 * jQuery UI Spinner 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/spinner/
 */


function spinner_modifier( fn ) {
	return function() {
		var previous = this.element.val();
		fn.apply( this, arguments );
		this._refresh();
		if ( previous !== this.element.val() ) {
			this._trigger( "change" );
		}
	};
}

var spinner = $.widget( "ui.spinner", {
	version: "1.11.4",
	defaultElement: "<input>",
	widgetEventPrefix: "spin",
	options: {
		culture: null,
		icons: {
			down: "ui-icon-triangle-1-s",
			up: "ui-icon-triangle-1-n"
		},
		incremental: true,
		max: null,
		min: null,
		numberFormat: null,
		page: 10,
		step: 1,

		change: null,
		spin: null,
		start: null,
		stop: null
	},

	_create: function() {
		// handle string values that need to be parsed
		this._setOption( "max", this.options.max );
		this._setOption( "min", this.options.min );
		this._setOption( "step", this.options.step );

		// Only format if there is a value, prevents the field from being marked
		// as invalid in Firefox, see #9573.
		if ( this.value() !== "" ) {
			// Format the value, but don't constrain.
			this._value( this.element.val(), true );
		}

		this._draw();
		this._on( this._events );
		this._refresh();

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_getCreateOptions: function() {
		var options = {},
			element = this.element;

		$.each( [ "min", "max", "step" ], function( i, option ) {
			var value = element.attr( option );
			if ( value !== undefined && value.length ) {
				options[ option ] = value;
			}
		});

		return options;
	},

	_events: {
		keydown: function( event ) {
			if ( this._start( event ) && this._keydown( event ) ) {
				event.preventDefault();
			}
		},
		keyup: "_stop",
		focus: function() {
			this.previous = this.element.val();
		},
		blur: function( event ) {
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}

			this._stop();
			this._refresh();
			if ( this.previous !== this.element.val() ) {
				this._trigger( "change", event );
			}
		},
		mousewheel: function( event, delta ) {
			if ( !delta ) {
				return;
			}
			if ( !this.spinning && !this._start( event ) ) {
				return false;
			}

			this._spin( (delta > 0 ? 1 : -1) * this.options.step, event );
			clearTimeout( this.mousewheelTimer );
			this.mousewheelTimer = this._delay(function() {
				if ( this.spinning ) {
					this._stop( event );
				}
			}, 100 );
			event.preventDefault();
		},
		"mousedown .ui-spinner-button": function( event ) {
			var previous;

			// We never want the buttons to have focus; whenever the user is
			// interacting with the spinner, the focus should be on the input.
			// If the input is focused then this.previous is properly set from
			// when the input first received focus. If the input is not focused
			// then we need to set this.previous based on the value before spinning.
			previous = this.element[0] === this.document[0].activeElement ?
				this.previous : this.element.val();
			function checkFocus() {
				var isActive = this.element[0] === this.document[0].activeElement;
				if ( !isActive ) {
					this.element.focus();
					this.previous = previous;
					// support: IE
					// IE sets focus asynchronously, so we need to check if focus
					// moved off of the input because the user clicked on the button.
					this._delay(function() {
						this.previous = previous;
					});
				}
			}

			// ensure focus is on (or stays on) the text field
			event.preventDefault();
			checkFocus.call( this );

			// support: IE
			// IE doesn't prevent moving focus even with event.preventDefault()
			// so we set a flag to know when we should ignore the blur event
			// and check (again) if focus moved off of the input.
			this.cancelBlur = true;
			this._delay(function() {
				delete this.cancelBlur;
				checkFocus.call( this );
			});

			if ( this._start( event ) === false ) {
				return;
			}

			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		"mouseup .ui-spinner-button": "_stop",
		"mouseenter .ui-spinner-button": function( event ) {
			// button will add ui-state-active if mouse was down while mouseleave and kept down
			if ( !$( event.currentTarget ).hasClass( "ui-state-active" ) ) {
				return;
			}

			if ( this._start( event ) === false ) {
				return false;
			}
			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		// TODO: do we really want to consider this a stop?
		// shouldn't we just stop the repeater and wait until mouseup before
		// we trigger the stop event?
		"mouseleave .ui-spinner-button": "_stop"
	},

	_draw: function() {
		var uiSpinner = this.uiSpinner = this.element
			.addClass( "ui-spinner-input" )
			.attr( "autocomplete", "off" )
			.wrap( this._uiSpinnerHtml() )
			.parent()
				// add buttons
				.append( this._buttonHtml() );

		this.element.attr( "role", "spinbutton" );

		// button bindings
		this.buttons = uiSpinner.find( ".ui-spinner-button" )
			.attr( "tabIndex", -1 )
			.button()
			.removeClass( "ui-corner-all" );

		// IE 6 doesn't understand height: 50% for the buttons
		// unless the wrapper has an explicit height
		if ( this.buttons.height() > Math.ceil( uiSpinner.height() * 0.5 ) &&
				uiSpinner.height() > 0 ) {
			uiSpinner.height( uiSpinner.height() );
		}

		// disable spinner if element was already disabled
		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_keydown: function( event ) {
		var options = this.options,
			keyCode = $.ui.keyCode;

		switch ( event.keyCode ) {
		case keyCode.UP:
			this._repeat( null, 1, event );
			return true;
		case keyCode.DOWN:
			this._repeat( null, -1, event );
			return true;
		case keyCode.PAGE_UP:
			this._repeat( null, options.page, event );
			return true;
		case keyCode.PAGE_DOWN:
			this._repeat( null, -options.page, event );
			return true;
		}

		return false;
	},

	_uiSpinnerHtml: function() {
		return "<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>";
	},

	_buttonHtml: function() {
		return "" +
			"<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>" +
				"<span class='ui-icon " + this.options.icons.up + "'>&#9650;</span>" +
			"</a>" +
			"<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" +
				"<span class='ui-icon " + this.options.icons.down + "'>&#9660;</span>" +
			"</a>";
	},

	_start: function( event ) {
		if ( !this.spinning && this._trigger( "start", event ) === false ) {
			return false;
		}

		if ( !this.counter ) {
			this.counter = 1;
		}
		this.spinning = true;
		return true;
	},

	_repeat: function( i, steps, event ) {
		i = i || 500;

		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			this._repeat( 40, steps, event );
		}, i );

		this._spin( steps * this.options.step, event );
	},

	_spin: function( step, event ) {
		var value = this.value() || 0;

		if ( !this.counter ) {
			this.counter = 1;
		}

		value = this._adjustValue( value + step * this._increment( this.counter ) );

		if ( !this.spinning || this._trigger( "spin", event, { value: value } ) !== false) {
			this._value( value );
			this.counter++;
		}
	},

	_increment: function( i ) {
		var incremental = this.options.incremental;

		if ( incremental ) {
			return $.isFunction( incremental ) ?
				incremental( i ) :
				Math.floor( i * i * i / 50000 - i * i / 500 + 17 * i / 200 + 1 );
		}

		return 1;
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_adjustValue: function( value ) {
		var base, aboveMin,
			options = this.options;

		// make sure we're at a valid step
		// - find out where we are relative to the base (min or 0)
		base = options.min !== null ? options.min : 0;
		aboveMin = value - base;
		// - round to the nearest step
		aboveMin = Math.round(aboveMin / options.step) * options.step;
		// - rounding is based on 0, so adjust back to our base
		value = base + aboveMin;

		// fix precision from bad JS floating point math
		value = parseFloat( value.toFixed( this._precision() ) );

		// clamp the value
		if ( options.max !== null && value > options.max) {
			return options.max;
		}
		if ( options.min !== null && value < options.min ) {
			return options.min;
		}

		return value;
	},

	_stop: function( event ) {
		if ( !this.spinning ) {
			return;
		}

		clearTimeout( this.timer );
		clearTimeout( this.mousewheelTimer );
		this.counter = 0;
		this.spinning = false;
		this._trigger( "stop", event );
	},

	_setOption: function( key, value ) {
		if ( key === "culture" || key === "numberFormat" ) {
			var prevValue = this._parse( this.element.val() );
			this.options[ key ] = value;
			this.element.val( this._format( prevValue ) );
			return;
		}

		if ( key === "max" || key === "min" || key === "step" ) {
			if ( typeof value === "string" ) {
				value = this._parse( value );
			}
		}
		if ( key === "icons" ) {
			this.buttons.first().find( ".ui-icon" )
				.removeClass( this.options.icons.up )
				.addClass( value.up );
			this.buttons.last().find( ".ui-icon" )
				.removeClass( this.options.icons.down )
				.addClass( value.down );
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this.widget().toggleClass( "ui-state-disabled", !!value );
			this.element.prop( "disabled", !!value );
			this.buttons.button( value ? "disable" : "enable" );
		}
	},

	_setOptions: spinner_modifier(function( options ) {
		this._super( options );
	}),

	_parse: function( val ) {
		if ( typeof val === "string" && val !== "" ) {
			val = window.Globalize && this.options.numberFormat ?
				Globalize.parseFloat( val, 10, this.options.culture ) : +val;
		}
		return val === "" || isNaN( val ) ? null : val;
	},

	_format: function( value ) {
		if ( value === "" ) {
			return "";
		}
		return window.Globalize && this.options.numberFormat ?
			Globalize.format( value, this.options.numberFormat, this.options.culture ) :
			value;
	},

	_refresh: function() {
		this.element.attr({
			"aria-valuemin": this.options.min,
			"aria-valuemax": this.options.max,
			// TODO: what should we do with values that can't be parsed?
			"aria-valuenow": this._parse( this.element.val() )
		});
	},

	isValid: function() {
		var value = this.value();

		// null is invalid
		if ( value === null ) {
			return false;
		}

		// if value gets adjusted, it's invalid
		return value === this._adjustValue( value );
	},

	// update the value without triggering change
	_value: function( value, allowAny ) {
		var parsed;
		if ( value !== "" ) {
			parsed = this._parse( value );
			if ( parsed !== null ) {
				if ( !allowAny ) {
					parsed = this._adjustValue( parsed );
				}
				value = this._format( parsed );
			}
		}
		this.element.val( value );
		this._refresh();
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-spinner-input" )
			.prop( "disabled", false )
			.removeAttr( "autocomplete" )
			.removeAttr( "role" )
			.removeAttr( "aria-valuemin" )
			.removeAttr( "aria-valuemax" )
			.removeAttr( "aria-valuenow" );
		this.uiSpinner.replaceWith( this.element );
	},

	stepUp: spinner_modifier(function( steps ) {
		this._stepUp( steps );
	}),
	_stepUp: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * this.options.step );
			this._stop();
		}
	},

	stepDown: spinner_modifier(function( steps ) {
		this._stepDown( steps );
	}),
	_stepDown: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * -this.options.step );
			this._stop();
		}
	},

	pageUp: spinner_modifier(function( pages ) {
		this._stepUp( (pages || 1) * this.options.page );
	}),

	pageDown: spinner_modifier(function( pages ) {
		this._stepDown( (pages || 1) * this.options.page );
	}),

	value: function( newVal ) {
		if ( !arguments.length ) {
			return this._parse( this.element.val() );
		}
		spinner_modifier( this._value ).call( this, newVal );
	},

	widget: function() {
		return this.uiSpinner;
	}
});


/*!
 * jQuery UI Tabs 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tabs/
 */


var tabs = $.widget( "ui.tabs", {
	version: "1.11.4",
	delay: 300,
	options: {
		active: null,
		collapsible: false,
		event: "click",
		heightStyle: "content",
		hide: null,
		show: null,

		// callbacks
		activate: null,
		beforeActivate: null,
		beforeLoad: null,
		load: null
	},

	_isLocal: (function() {
		var rhash = /#.*$/;

		return function( anchor ) {
			var anchorUrl, locationUrl;

			// support: IE7
			// IE7 doesn't normalize the href property when set via script (#9317)
			anchor = anchor.cloneNode( false );

			anchorUrl = anchor.href.replace( rhash, "" );
			locationUrl = location.href.replace( rhash, "" );

			// decoding may throw an error if the URL isn't UTF-8 (#9518)
			try {
				anchorUrl = decodeURIComponent( anchorUrl );
			} catch ( error ) {}
			try {
				locationUrl = decodeURIComponent( locationUrl );
			} catch ( error ) {}

			return anchor.hash.length > 1 && anchorUrl === locationUrl;
		};
	})(),

	_create: function() {
		var that = this,
			options = this.options;

		this.running = false;

		this.element
			.addClass( "ui-tabs ui-widget ui-widget-content ui-corner-all" )
			.toggleClass( "ui-tabs-collapsible", options.collapsible );

		this._processTabs();
		options.active = this._initialActive();

		// Take disabling tabs via class attribute from HTML
		// into account and update option properly.
		if ( $.isArray( options.disabled ) ) {
			options.disabled = $.unique( options.disabled.concat(
				$.map( this.tabs.filter( ".ui-state-disabled" ), function( li ) {
					return that.tabs.index( li );
				})
			) ).sort();
		}

		// check for length avoids error when initializing empty list
		if ( this.options.active !== false && this.anchors.length ) {
			this.active = this._findActive( options.active );
		} else {
			this.active = $();
		}

		this._refresh();

		if ( this.active.length ) {
			this.load( options.active );
		}
	},

	_initialActive: function() {
		var active = this.options.active,
			collapsible = this.options.collapsible,
			locationHash = location.hash.substring( 1 );

		if ( active === null ) {
			// check the fragment identifier in the URL
			if ( locationHash ) {
				this.tabs.each(function( i, tab ) {
					if ( $( tab ).attr( "aria-controls" ) === locationHash ) {
						active = i;
						return false;
					}
				});
			}

			// check for a tab marked active via a class
			if ( active === null ) {
				active = this.tabs.index( this.tabs.filter( ".ui-tabs-active" ) );
			}

			// no active tab, set to false
			if ( active === null || active === -1 ) {
				active = this.tabs.length ? 0 : false;
			}
		}

		// handle numbers: negative, out of range
		if ( active !== false ) {
			active = this.tabs.index( this.tabs.eq( active ) );
			if ( active === -1 ) {
				active = collapsible ? false : 0;
			}
		}

		// don't allow collapsible: false and active: false
		if ( !collapsible && active === false && this.anchors.length ) {
			active = 0;
		}

		return active;
	},

	_getCreateEventData: function() {
		return {
			tab: this.active,
			panel: !this.active.length ? $() : this._getPanelForTab( this.active )
		};
	},

	_tabKeydown: function( event ) {
		var focusedTab = $( this.document[0].activeElement ).closest( "li" ),
			selectedIndex = this.tabs.index( focusedTab ),
			goingForward = true;

		if ( this._handlePageNav( event ) ) {
			return;
		}

		switch ( event.keyCode ) {
			case $.ui.keyCode.RIGHT:
			case $.ui.keyCode.DOWN:
				selectedIndex++;
				break;
			case $.ui.keyCode.UP:
			case $.ui.keyCode.LEFT:
				goingForward = false;
				selectedIndex--;
				break;
			case $.ui.keyCode.END:
				selectedIndex = this.anchors.length - 1;
				break;
			case $.ui.keyCode.HOME:
				selectedIndex = 0;
				break;
			case $.ui.keyCode.SPACE:
				// Activate only, no collapsing
				event.preventDefault();
				clearTimeout( this.activating );
				this._activate( selectedIndex );
				return;
			case $.ui.keyCode.ENTER:
				// Toggle (cancel delayed activation, allow collapsing)
				event.preventDefault();
				clearTimeout( this.activating );
				// Determine if we should collapse or activate
				this._activate( selectedIndex === this.options.active ? false : selectedIndex );
				return;
			default:
				return;
		}

		// Focus the appropriate tab, based on which key was pressed
		event.preventDefault();
		clearTimeout( this.activating );
		selectedIndex = this._focusNextTab( selectedIndex, goingForward );

		// Navigating with control/command key will prevent automatic activation
		if ( !event.ctrlKey && !event.metaKey ) {

			// Update aria-selected immediately so that AT think the tab is already selected.
			// Otherwise AT may confuse the user by stating that they need to activate the tab,
			// but the tab will already be activated by the time the announcement finishes.
			focusedTab.attr( "aria-selected", "false" );
			this.tabs.eq( selectedIndex ).attr( "aria-selected", "true" );

			this.activating = this._delay(function() {
				this.option( "active", selectedIndex );
			}, this.delay );
		}
	},

	_panelKeydown: function( event ) {
		if ( this._handlePageNav( event ) ) {
			return;
		}

		// Ctrl+up moves focus to the current tab
		if ( event.ctrlKey && event.keyCode === $.ui.keyCode.UP ) {
			event.preventDefault();
			this.active.focus();
		}
	},

	// Alt+page up/down moves focus to the previous/next tab (and activates)
	_handlePageNav: function( event ) {
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_UP ) {
			this._activate( this._focusNextTab( this.options.active - 1, false ) );
			return true;
		}
		if ( event.altKey && event.keyCode === $.ui.keyCode.PAGE_DOWN ) {
			this._activate( this._focusNextTab( this.options.active + 1, true ) );
			return true;
		}
	},

	_findNextTab: function( index, goingForward ) {
		var lastTabIndex = this.tabs.length - 1;

		function constrain() {
			if ( index > lastTabIndex ) {
				index = 0;
			}
			if ( index < 0 ) {
				index = lastTabIndex;
			}
			return index;
		}

		while ( $.inArray( constrain(), this.options.disabled ) !== -1 ) {
			index = goingForward ? index + 1 : index - 1;
		}

		return index;
	},

	_focusNextTab: function( index, goingForward ) {
		index = this._findNextTab( index, goingForward );
		this.tabs.eq( index ).focus();
		return index;
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {
			// _activate() will handle invalid values and update this.options
			this._activate( value );
			return;
		}

		if ( key === "disabled" ) {
			// don't use the widget factory's disabled handling
			this._setupDisabled( value );
			return;
		}

		this._super( key, value);

		if ( key === "collapsible" ) {
			this.element.toggleClass( "ui-tabs-collapsible", value );
			// Setting collapsible: false while collapsed; open first panel
			if ( !value && this.options.active === false ) {
				this._activate( 0 );
			}
		}

		if ( key === "event" ) {
			this._setupEvents( value );
		}

		if ( key === "heightStyle" ) {
			this._setupHeightStyle( value );
		}
	},

	_sanitizeSelector: function( hash ) {
		return hash ? hash.replace( /[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&" ) : "";
	},

	refresh: function() {
		var options = this.options,
			lis = this.tablist.children( ":has(a[href])" );

		// get disabled tabs from class attribute from HTML
		// this will get converted to a boolean if needed in _refresh()
		options.disabled = $.map( lis.filter( ".ui-state-disabled" ), function( tab ) {
			return lis.index( tab );
		});

		this._processTabs();

		// was collapsed or no tabs
		if ( options.active === false || !this.anchors.length ) {
			options.active = false;
			this.active = $();
		// was active, but active tab is gone
		} else if ( this.active.length && !$.contains( this.tablist[ 0 ], this.active[ 0 ] ) ) {
			// all remaining tabs are disabled
			if ( this.tabs.length === options.disabled.length ) {
				options.active = false;
				this.active = $();
			// activate previous tab
			} else {
				this._activate( this._findNextTab( Math.max( 0, options.active - 1 ), false ) );
			}
		// was active, active tab still exists
		} else {
			// make sure active index is correct
			options.active = this.tabs.index( this.active );
		}

		this._refresh();
	},

	_refresh: function() {
		this._setupDisabled( this.options.disabled );
		this._setupEvents( this.options.event );
		this._setupHeightStyle( this.options.heightStyle );

		this.tabs.not( this.active ).attr({
			"aria-selected": "false",
			"aria-expanded": "false",
			tabIndex: -1
		});
		this.panels.not( this._getPanelForTab( this.active ) )
			.hide()
			.attr({
				"aria-hidden": "true"
			});

		// Make sure one tab is in the tab order
		if ( !this.active.length ) {
			this.tabs.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active
				.addClass( "ui-tabs-active ui-state-active" )
				.attr({
					"aria-selected": "true",
					"aria-expanded": "true",
					tabIndex: 0
				});
			this._getPanelForTab( this.active )
				.show()
				.attr({
					"aria-hidden": "false"
				});
		}
	},

	_processTabs: function() {
		var that = this,
			prevTabs = this.tabs,
			prevAnchors = this.anchors,
			prevPanels = this.panels;

		this.tablist = this._getList()
			.addClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" )
			.attr( "role", "tablist" )

			// Prevent users from focusing disabled tabs via click
			.delegate( "> li", "mousedown" + this.eventNamespace, function( event ) {
				if ( $( this ).is( ".ui-state-disabled" ) ) {
					event.preventDefault();
				}
			})

			// support: IE <9
			// Preventing the default action in mousedown doesn't prevent IE
			// from focusing the element, so if the anchor gets focused, blur.
			// We don't have to worry about focusing the previously focused
			// element since clicking on a non-focusable element should focus
			// the body anyway.
			.delegate( ".ui-tabs-anchor", "focus" + this.eventNamespace, function() {
				if ( $( this ).closest( "li" ).is( ".ui-state-disabled" ) ) {
					this.blur();
				}
			});

		this.tabs = this.tablist.find( "> li:has(a[href])" )
			.addClass( "ui-state-default ui-corner-top" )
			.attr({
				role: "tab",
				tabIndex: -1
			});

		this.anchors = this.tabs.map(function() {
				return $( "a", this )[ 0 ];
			})
			.addClass( "ui-tabs-anchor" )
			.attr({
				role: "presentation",
				tabIndex: -1
			});

		this.panels = $();

		this.anchors.each(function( i, anchor ) {
			var selector, panel, panelId,
				anchorId = $( anchor ).uniqueId().attr( "id" ),
				tab = $( anchor ).closest( "li" ),
				originalAriaControls = tab.attr( "aria-controls" );

			// inline tab
			if ( that._isLocal( anchor ) ) {
				selector = anchor.hash;
				panelId = selector.substring( 1 );
				panel = that.element.find( that._sanitizeSelector( selector ) );
			// remote tab
			} else {
				// If the tab doesn't already have aria-controls,
				// generate an id by using a throw-away element
				panelId = tab.attr( "aria-controls" ) || $( {} ).uniqueId()[ 0 ].id;
				selector = "#" + panelId;
				panel = that.element.find( selector );
				if ( !panel.length ) {
					panel = that._createPanel( panelId );
					panel.insertAfter( that.panels[ i - 1 ] || that.tablist );
				}
				panel.attr( "aria-live", "polite" );
			}

			if ( panel.length) {
				that.panels = that.panels.add( panel );
			}
			if ( originalAriaControls ) {
				tab.data( "ui-tabs-aria-controls", originalAriaControls );
			}
			tab.attr({
				"aria-controls": panelId,
				"aria-labelledby": anchorId
			});
			panel.attr( "aria-labelledby", anchorId );
		});

		this.panels
			.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" )
			.attr( "role", "tabpanel" );

		// Avoid memory leaks (#10056)
		if ( prevTabs ) {
			this._off( prevTabs.not( this.tabs ) );
			this._off( prevAnchors.not( this.anchors ) );
			this._off( prevPanels.not( this.panels ) );
		}
	},

	// allow overriding how to find the list for rare usage scenarios (#7715)
	_getList: function() {
		return this.tablist || this.element.find( "ol,ul" ).eq( 0 );
	},

	_createPanel: function( id ) {
		return $( "<div>" )
			.attr( "id", id )
			.addClass( "ui-tabs-panel ui-widget-content ui-corner-bottom" )
			.data( "ui-tabs-destroy", true );
	},

	_setupDisabled: function( disabled ) {
		if ( $.isArray( disabled ) ) {
			if ( !disabled.length ) {
				disabled = false;
			} else if ( disabled.length === this.anchors.length ) {
				disabled = true;
			}
		}

		// disable tabs
		for ( var i = 0, li; ( li = this.tabs[ i ] ); i++ ) {
			if ( disabled === true || $.inArray( i, disabled ) !== -1 ) {
				$( li )
					.addClass( "ui-state-disabled" )
					.attr( "aria-disabled", "true" );
			} else {
				$( li )
					.removeClass( "ui-state-disabled" )
					.removeAttr( "aria-disabled" );
			}
		}

		this.options.disabled = disabled;
	},

	_setupEvents: function( event ) {
		var events = {};
		if ( event ) {
			$.each( event.split(" "), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			});
		}

		this._off( this.anchors.add( this.tabs ).add( this.panels ) );
		// Always prevent the default action, even when disabled
		this._on( true, this.anchors, {
			click: function( event ) {
				event.preventDefault();
			}
		});
		this._on( this.anchors, events );
		this._on( this.tabs, { keydown: "_tabKeydown" } );
		this._on( this.panels, { keydown: "_panelKeydown" } );

		this._focusable( this.tabs );
		this._hoverable( this.tabs );
	},

	_setupHeightStyle: function( heightStyle ) {
		var maxHeight,
			parent = this.element.parent();

		if ( heightStyle === "fill" ) {
			maxHeight = parent.height();
			maxHeight -= this.element.outerHeight() - this.element.height();

			this.element.siblings( ":visible" ).each(function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			});

			this.element.children().not( this.panels ).each(function() {
				maxHeight -= $( this ).outerHeight( true );
			});

			this.panels.each(function() {
				$( this ).height( Math.max( 0, maxHeight -
					$( this ).innerHeight() + $( this ).height() ) );
			})
			.css( "overflow", "auto" );
		} else if ( heightStyle === "auto" ) {
			maxHeight = 0;
			this.panels.each(function() {
				maxHeight = Math.max( maxHeight, $( this ).height( "" ).height() );
			}).height( maxHeight );
		}
	},

	_eventHandler: function( event ) {
		var options = this.options,
			active = this.active,
			anchor = $( event.currentTarget ),
			tab = anchor.closest( "li" ),
			clickedIsActive = tab[ 0 ] === active[ 0 ],
			collapsing = clickedIsActive && options.collapsible,
			toShow = collapsing ? $() : this._getPanelForTab( tab ),
			toHide = !active.length ? $() : this._getPanelForTab( active ),
			eventData = {
				oldTab: active,
				oldPanel: toHide,
				newTab: collapsing ? $() : tab,
				newPanel: toShow
			};

		event.preventDefault();

		if ( tab.hasClass( "ui-state-disabled" ) ||
				// tab is already loading
				tab.hasClass( "ui-tabs-loading" ) ||
				// can't switch durning an animation
				this.running ||
				// click on active header, but not collapsible
				( clickedIsActive && !options.collapsible ) ||
				// allow canceling activation
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.tabs.index( tab );

		this.active = clickedIsActive ? $() : tab;
		if ( this.xhr ) {
			this.xhr.abort();
		}

		if ( !toHide.length && !toShow.length ) {
			$.error( "jQuery UI Tabs: Mismatching fragment identifier." );
		}

		if ( toShow.length ) {
			this.load( this.tabs.index( tab ), event );
		}
		this._toggle( event, eventData );
	},

	// handles show/hide for selecting tabs
	_toggle: function( event, eventData ) {
		var that = this,
			toShow = eventData.newPanel,
			toHide = eventData.oldPanel;

		this.running = true;

		function complete() {
			that.running = false;
			that._trigger( "activate", event, eventData );
		}

		function show() {
			eventData.newTab.closest( "li" ).addClass( "ui-tabs-active ui-state-active" );

			if ( toShow.length && that.options.show ) {
				that._show( toShow, that.options.show, complete );
			} else {
				toShow.show();
				complete();
			}
		}

		// start out by hiding, then showing, then completing
		if ( toHide.length && this.options.hide ) {
			this._hide( toHide, this.options.hide, function() {
				eventData.oldTab.closest( "li" ).removeClass( "ui-tabs-active ui-state-active" );
				show();
			});
		} else {
			eventData.oldTab.closest( "li" ).removeClass( "ui-tabs-active ui-state-active" );
			toHide.hide();
			show();
		}

		toHide.attr( "aria-hidden", "true" );
		eventData.oldTab.attr({
			"aria-selected": "false",
			"aria-expanded": "false"
		});
		// If we're switching tabs, remove the old tab from the tab order.
		// If we're opening from collapsed state, remove the previous tab from the tab order.
		// If we're collapsing, then keep the collapsing tab in the tab order.
		if ( toShow.length && toHide.length ) {
			eventData.oldTab.attr( "tabIndex", -1 );
		} else if ( toShow.length ) {
			this.tabs.filter(function() {
				return $( this ).attr( "tabIndex" ) === 0;
			})
			.attr( "tabIndex", -1 );
		}

		toShow.attr( "aria-hidden", "false" );
		eventData.newTab.attr({
			"aria-selected": "true",
			"aria-expanded": "true",
			tabIndex: 0
		});
	},

	_activate: function( index ) {
		var anchor,
			active = this._findActive( index );

		// trying to activate the already active panel
		if ( active[ 0 ] === this.active[ 0 ] ) {
			return;
		}

		// trying to collapse, simulate a click on the current active header
		if ( !active.length ) {
			active = this.active;
		}

		anchor = active.find( ".ui-tabs-anchor" )[ 0 ];
		this._eventHandler({
			target: anchor,
			currentTarget: anchor,
			preventDefault: $.noop
		});
	},

	_findActive: function( index ) {
		return index === false ? $() : this.tabs.eq( index );
	},

	_getIndex: function( index ) {
		// meta-function to give users option to provide a href string instead of a numerical index.
		if ( typeof index === "string" ) {
			index = this.anchors.index( this.anchors.filter( "[href$='" + index + "']" ) );
		}

		return index;
	},

	_destroy: function() {
		if ( this.xhr ) {
			this.xhr.abort();
		}

		this.element.removeClass( "ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible" );

		this.tablist
			.removeClass( "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" )
			.removeAttr( "role" );

		this.anchors
			.removeClass( "ui-tabs-anchor" )
			.removeAttr( "role" )
			.removeAttr( "tabIndex" )
			.removeUniqueId();

		this.tablist.unbind( this.eventNamespace );

		this.tabs.add( this.panels ).each(function() {
			if ( $.data( this, "ui-tabs-destroy" ) ) {
				$( this ).remove();
			} else {
				$( this )
					.removeClass( "ui-state-default ui-state-active ui-state-disabled " +
						"ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel" )
					.removeAttr( "tabIndex" )
					.removeAttr( "aria-live" )
					.removeAttr( "aria-busy" )
					.removeAttr( "aria-selected" )
					.removeAttr( "aria-labelledby" )
					.removeAttr( "aria-hidden" )
					.removeAttr( "aria-expanded" )
					.removeAttr( "role" );
			}
		});

		this.tabs.each(function() {
			var li = $( this ),
				prev = li.data( "ui-tabs-aria-controls" );
			if ( prev ) {
				li
					.attr( "aria-controls", prev )
					.removeData( "ui-tabs-aria-controls" );
			} else {
				li.removeAttr( "aria-controls" );
			}
		});

		this.panels.show();

		if ( this.options.heightStyle !== "content" ) {
			this.panels.css( "height", "" );
		}
	},

	enable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === false ) {
			return;
		}

		if ( index === undefined ) {
			disabled = false;
		} else {
			index = this._getIndex( index );
			if ( $.isArray( disabled ) ) {
				disabled = $.map( disabled, function( num ) {
					return num !== index ? num : null;
				});
			} else {
				disabled = $.map( this.tabs, function( li, num ) {
					return num !== index ? num : null;
				});
			}
		}
		this._setupDisabled( disabled );
	},

	disable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === true ) {
			return;
		}

		if ( index === undefined ) {
			disabled = true;
		} else {
			index = this._getIndex( index );
			if ( $.inArray( index, disabled ) !== -1 ) {
				return;
			}
			if ( $.isArray( disabled ) ) {
				disabled = $.merge( [ index ], disabled ).sort();
			} else {
				disabled = [ index ];
			}
		}
		this._setupDisabled( disabled );
	},

	load: function( index, event ) {
		index = this._getIndex( index );
		var that = this,
			tab = this.tabs.eq( index ),
			anchor = tab.find( ".ui-tabs-anchor" ),
			panel = this._getPanelForTab( tab ),
			eventData = {
				tab: tab,
				panel: panel
			},
			complete = function( jqXHR, status ) {
				if ( status === "abort" ) {
					that.panels.stop( false, true );
				}

				tab.removeClass( "ui-tabs-loading" );
				panel.removeAttr( "aria-busy" );

				if ( jqXHR === that.xhr ) {
					delete that.xhr;
				}
			};

		// not remote
		if ( this._isLocal( anchor[ 0 ] ) ) {
			return;
		}

		this.xhr = $.ajax( this._ajaxSettings( anchor, event, eventData ) );

		// support: jQuery <1.8
		// jQuery <1.8 returns false if the request is canceled in beforeSend,
		// but as of 1.8, $.ajax() always returns a jqXHR object.
		if ( this.xhr && this.xhr.statusText !== "canceled" ) {
			tab.addClass( "ui-tabs-loading" );
			panel.attr( "aria-busy", "true" );

			this.xhr
				.done(function( response, status, jqXHR ) {
					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						panel.html( response );
						that._trigger( "load", event, eventData );

						complete( jqXHR, status );
					}, 1 );
				})
				.fail(function( jqXHR, status ) {
					// support: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						complete( jqXHR, status );
					}, 1 );
				});
		}
	},

	_ajaxSettings: function( anchor, event, eventData ) {
		var that = this;
		return {
			url: anchor.attr( "href" ),
			beforeSend: function( jqXHR, settings ) {
				return that._trigger( "beforeLoad", event,
					$.extend( { jqXHR: jqXHR, ajaxSettings: settings }, eventData ) );
			}
		};
	},

	_getPanelForTab: function( tab ) {
		var id = $( tab ).attr( "aria-controls" );
		return this.element.find( this._sanitizeSelector( "#" + id ) );
	}
});


/*!
 * jQuery UI Tooltip 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tooltip/
 */


var tooltip = $.widget( "ui.tooltip", {
	version: "1.11.4",
	options: {
		content: function() {
			// support: IE<9, Opera in jQuery <1.7
			// .text() can't accept undefined, so coerce to a string
			var title = $( this ).attr( "title" ) || "";
			// Escape title, since we're going from an attribute to raw HTML
			return $( "<a>" ).text( title ).html();
		},
		hide: true,
		// Disabled elements have inconsistent behavior across browsers (#8661)
		items: "[title]:not([disabled])",
		position: {
			my: "left top+15",
			at: "left bottom",
			collision: "flipfit flip"
		},
		show: true,
		tooltipClass: null,
		track: false,

		// callbacks
		close: null,
		open: null
	},

	_addDescribedBy: function( elem, id ) {
		var describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ );
		describedby.push( id );
		elem
			.data( "ui-tooltip-id", id )
			.attr( "aria-describedby", $.trim( describedby.join( " " ) ) );
	},

	_removeDescribedBy: function( elem ) {
		var id = elem.data( "ui-tooltip-id" ),
			describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ ),
			index = $.inArray( id, describedby );

		if ( index !== -1 ) {
			describedby.splice( index, 1 );
		}

		elem.removeData( "ui-tooltip-id" );
		describedby = $.trim( describedby.join( " " ) );
		if ( describedby ) {
			elem.attr( "aria-describedby", describedby );
		} else {
			elem.removeAttr( "aria-describedby" );
		}
	},

	_create: function() {
		this._on({
			mouseover: "open",
			focusin: "open"
		});

		// IDs of generated tooltips, needed for destroy
		this.tooltips = {};

		// IDs of parent tooltips where we removed the title attribute
		this.parents = {};

		if ( this.options.disabled ) {
			this._disable();
		}

		// Append the aria-live region so tooltips announce correctly
		this.liveRegion = $( "<div>" )
			.attr({
				role: "log",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			})
			.addClass( "ui-helper-hidden-accessible" )
			.appendTo( this.document[ 0 ].body );
	},

	_setOption: function( key, value ) {
		var that = this;

		if ( key === "disabled" ) {
			this[ value ? "_disable" : "_enable" ]();
			this.options[ key ] = value;
			// disable element style changes
			return;
		}

		this._super( key, value );

		if ( key === "content" ) {
			$.each( this.tooltips, function( id, tooltipData ) {
				that._updateContent( tooltipData.element );
			});
		}
	},

	_disable: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, tooltipData ) {
			var event = $.Event( "blur" );
			event.target = event.currentTarget = tooltipData.element[ 0 ];
			that.close( event, true );
		});

		// remove title attributes to prevent native tooltips
		this.element.find( this.options.items ).addBack().each(function() {
			var element = $( this );
			if ( element.is( "[title]" ) ) {
				element
					.data( "ui-tooltip-title", element.attr( "title" ) )
					.removeAttr( "title" );
			}
		});
	},

	_enable: function() {
		// restore title attributes
		this.element.find( this.options.items ).addBack().each(function() {
			var element = $( this );
			if ( element.data( "ui-tooltip-title" ) ) {
				element.attr( "title", element.data( "ui-tooltip-title" ) );
			}
		});
	},

	open: function( event ) {
		var that = this,
			target = $( event ? event.target : this.element )
				// we need closest here due to mouseover bubbling,
				// but always pointing at the same event target
				.closest( this.options.items );

		// No element to show a tooltip for or the tooltip is already open
		if ( !target.length || target.data( "ui-tooltip-id" ) ) {
			return;
		}

		if ( target.attr( "title" ) ) {
			target.data( "ui-tooltip-title", target.attr( "title" ) );
		}

		target.data( "ui-tooltip-open", true );

		// kill parent tooltips, custom or native, for hover
		if ( event && event.type === "mouseover" ) {
			target.parents().each(function() {
				var parent = $( this ),
					blurEvent;
				if ( parent.data( "ui-tooltip-open" ) ) {
					blurEvent = $.Event( "blur" );
					blurEvent.target = blurEvent.currentTarget = this;
					that.close( blurEvent, true );
				}
				if ( parent.attr( "title" ) ) {
					parent.uniqueId();
					that.parents[ this.id ] = {
						element: this,
						title: parent.attr( "title" )
					};
					parent.attr( "title", "" );
				}
			});
		}

		this._registerCloseHandlers( event, target );
		this._updateContent( target, event );
	},

	_updateContent: function( target, event ) {
		var content,
			contentOption = this.options.content,
			that = this,
			eventType = event ? event.type : null;

		if ( typeof contentOption === "string" ) {
			return this._open( event, target, contentOption );
		}

		content = contentOption.call( target[0], function( response ) {

			// IE may instantly serve a cached response for ajax requests
			// delay this call to _open so the other call to _open runs first
			that._delay(function() {

				// Ignore async response if tooltip was closed already
				if ( !target.data( "ui-tooltip-open" ) ) {
					return;
				}

				// jQuery creates a special event for focusin when it doesn't
				// exist natively. To improve performance, the native event
				// object is reused and the type is changed. Therefore, we can't
				// rely on the type being correct after the event finished
				// bubbling, so we set it back to the previous value. (#8740)
				if ( event ) {
					event.type = eventType;
				}
				this._open( event, target, response );
			});
		});
		if ( content ) {
			this._open( event, target, content );
		}
	},

	_open: function( event, target, content ) {
		var tooltipData, tooltip, delayedShow, a11yContent,
			positionOption = $.extend( {}, this.options.position );

		if ( !content ) {
			return;
		}

		// Content can be updated multiple times. If the tooltip already
		// exists, then just update the content and bail.
		tooltipData = this._find( target );
		if ( tooltipData ) {
			tooltipData.tooltip.find( ".ui-tooltip-content" ).html( content );
			return;
		}

		// if we have a title, clear it to prevent the native tooltip
		// we have to check first to avoid defining a title if none exists
		// (we don't want to cause an element to start matching [title])
		//
		// We use removeAttr only for key events, to allow IE to export the correct
		// accessible attributes. For mouse events, set to empty string to avoid
		// native tooltip showing up (happens only when removing inside mouseover).
		if ( target.is( "[title]" ) ) {
			if ( event && event.type === "mouseover" ) {
				target.attr( "title", "" );
			} else {
				target.removeAttr( "title" );
			}
		}

		tooltipData = this._tooltip( target );
		tooltip = tooltipData.tooltip;
		this._addDescribedBy( target, tooltip.attr( "id" ) );
		tooltip.find( ".ui-tooltip-content" ).html( content );

		// Support: Voiceover on OS X, JAWS on IE <= 9
		// JAWS announces deletions even when aria-relevant="additions"
		// Voiceover will sometimes re-read the entire log region's contents from the beginning
		this.liveRegion.children().hide();
		if ( content.clone ) {
			a11yContent = content.clone();
			a11yContent.removeAttr( "id" ).find( "[id]" ).removeAttr( "id" );
		} else {
			a11yContent = content;
		}
		$( "<div>" ).html( a11yContent ).appendTo( this.liveRegion );

		function position( event ) {
			positionOption.of = event;
			if ( tooltip.is( ":hidden" ) ) {
				return;
			}
			tooltip.position( positionOption );
		}
		if ( this.options.track && event && /^mouse/.test( event.type ) ) {
			this._on( this.document, {
				mousemove: position
			});
			// trigger once to override element-relative positioning
			position( event );
		} else {
			tooltip.position( $.extend({
				of: target
			}, this.options.position ) );
		}

		tooltip.hide();

		this._show( tooltip, this.options.show );
		// Handle tracking tooltips that are shown with a delay (#8644). As soon
		// as the tooltip is visible, position the tooltip using the most recent
		// event.
		if ( this.options.show && this.options.show.delay ) {
			delayedShow = this.delayedShow = setInterval(function() {
				if ( tooltip.is( ":visible" ) ) {
					position( positionOption.of );
					clearInterval( delayedShow );
				}
			}, $.fx.interval );
		}

		this._trigger( "open", event, { tooltip: tooltip } );
	},

	_registerCloseHandlers: function( event, target ) {
		var events = {
			keyup: function( event ) {
				if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
					var fakeEvent = $.Event(event);
					fakeEvent.currentTarget = target[0];
					this.close( fakeEvent, true );
				}
			}
		};

		// Only bind remove handler for delegated targets. Non-delegated
		// tooltips will handle this in destroy.
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			events.remove = function() {
				this._removeTooltip( this._find( target ).tooltip );
			};
		}

		if ( !event || event.type === "mouseover" ) {
			events.mouseleave = "close";
		}
		if ( !event || event.type === "focusin" ) {
			events.focusout = "close";
		}
		this._on( true, target, events );
	},

	close: function( event ) {
		var tooltip,
			that = this,
			target = $( event ? event.currentTarget : this.element ),
			tooltipData = this._find( target );

		// The tooltip may already be closed
		if ( !tooltipData ) {

			// We set ui-tooltip-open immediately upon open (in open()), but only set the
			// additional data once there's actually content to show (in _open()). So even if the
			// tooltip doesn't have full data, we always remove ui-tooltip-open in case we're in
			// the period between open() and _open().
			target.removeData( "ui-tooltip-open" );
			return;
		}

		tooltip = tooltipData.tooltip;

		// disabling closes the tooltip, so we need to track when we're closing
		// to avoid an infinite loop in case the tooltip becomes disabled on close
		if ( tooltipData.closing ) {
			return;
		}

		// Clear the interval for delayed tracking tooltips
		clearInterval( this.delayedShow );

		// only set title if we had one before (see comment in _open())
		// If the title attribute has changed since open(), don't restore
		if ( target.data( "ui-tooltip-title" ) && !target.attr( "title" ) ) {
			target.attr( "title", target.data( "ui-tooltip-title" ) );
		}

		this._removeDescribedBy( target );

		tooltipData.hiding = true;
		tooltip.stop( true );
		this._hide( tooltip, this.options.hide, function() {
			that._removeTooltip( $( this ) );
		});

		target.removeData( "ui-tooltip-open" );
		this._off( target, "mouseleave focusout keyup" );

		// Remove 'remove' binding only on delegated targets
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			this._off( target, "remove" );
		}
		this._off( this.document, "mousemove" );

		if ( event && event.type === "mouseleave" ) {
			$.each( this.parents, function( id, parent ) {
				$( parent.element ).attr( "title", parent.title );
				delete that.parents[ id ];
			});
		}

		tooltipData.closing = true;
		this._trigger( "close", event, { tooltip: tooltip } );
		if ( !tooltipData.hiding ) {
			tooltipData.closing = false;
		}
	},

	_tooltip: function( element ) {
		var tooltip = $( "<div>" )
				.attr( "role", "tooltip" )
				.addClass( "ui-tooltip ui-widget ui-corner-all ui-widget-content " +
					( this.options.tooltipClass || "" ) ),
			id = tooltip.uniqueId().attr( "id" );

		$( "<div>" )
			.addClass( "ui-tooltip-content" )
			.appendTo( tooltip );

		tooltip.appendTo( this.document[0].body );

		return this.tooltips[ id ] = {
			element: element,
			tooltip: tooltip
		};
	},

	_find: function( target ) {
		var id = target.data( "ui-tooltip-id" );
		return id ? this.tooltips[ id ] : null;
	},

	_removeTooltip: function( tooltip ) {
		tooltip.remove();
		delete this.tooltips[ tooltip.attr( "id" ) ];
	},

	_destroy: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, tooltipData ) {
			// Delegate to close method to handle common cleanup
			var event = $.Event( "blur" ),
				element = tooltipData.element;
			event.target = event.currentTarget = element[ 0 ];
			that.close( event, true );

			// Remove immediately; destroying an open tooltip doesn't use the
			// hide animation
			$( "#" + id ).remove();

			// Restore the title
			if ( element.data( "ui-tooltip-title" ) ) {
				// If the title attribute has changed since open(), don't restore
				if ( !element.attr( "title" ) ) {
					element.attr( "title", element.data( "ui-tooltip-title" ) );
				}
				element.removeData( "ui-tooltip-title" );
			}
		});
		this.liveRegion.remove();
	}
});



}));