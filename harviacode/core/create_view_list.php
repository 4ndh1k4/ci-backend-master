<?php 

$string = "
       
    <!-- Content Header (Page header) -->
    <section class=\"content-header\">
      <h1>
        
        <small></small>
      </h1>
      <ol class=\"breadcrumb\">
        <li><?php echo anchor('dashboard','<i class=\"fa fa-dashboard\"></i> Dashboard</a>')?></li>
      </ol>
    </section>
	
<!-- Main content -->
    <section class=\"content\">
	<?php if(isset(\$message)){   
		 echo '<div class=\"alert alert-warning\">  
		   <a href=\"#\" class=\"close\" data-dismiss=\"alert\">&times;</a>  
		   '.\$message.'
		 </div> '; 
    }  ?>
      <!-- Default box -->
      <div class=\"box\">
        <div class=\"box-header\">
		 <h3 class=\"box-title\">Daftar ".ucfirst($table_name)."</h3><hr />	
        
			 <?php echo anchor(site_url('".$c_url."/create'),'<i class = \"fa fa-plus\"></i> Tambah', 'class=\"btn btn-flat btn-primary\"'); ?>
            
            <div class=\"box-tools pull-right\">
                <form action=\"<?php echo site_url('$c_url/index'); ?>\" class=\"form-inline\" method=\"get\">
                    <div class=\"input-group\">
                        <input type=\"text\" class=\"form-control\" name=\"q\" value=\"<?php echo \$q; ?>\">
                        <span class=\"input-group-btn\">
                            <?php 
                                if (\$q <> '')
                                {
                                    ?>
                                    <a href=\"<?php echo site_url('$c_url'); ?>\" class=\"btn btn-flat btn-default\">Reset</a>
                                    <?php
                                }
                            ?>
                          <button class=\"btn btn-flat btn-primary\" type=\"submit\"><i class=\"fa fa-search\"></i></button>
                        </span>
                    </div>
                </form>
            </div>
        </div>
		<div class=\"box-body\">
        <table class=\"table table-bordered\" style=\"margin-bottom: 10px\">
            <tr>
                <th>No</th>";
foreach ($non_pk as $row) {
    $string .= "\n\t\t<th>" . label($row['column_name']) . "</th>";
}
$string .= "\n\t\t<th>Aksi</th>
            </tr>";
$string .= "<?php
            foreach ($" . $c_url . "_data as \$$c_url)
            {
                ?>
                <tr>";

$string .= "\n\t\t\t<td width=\"80px\"><?php echo ++\$start ?></td>";
foreach ($non_pk as $row) {
    $string .= "\n\t\t\t<td><?php echo $" . $c_url ."->". $row['column_name'] . " ?></td>";
}


$string .= "\n\t\t\t<td style=\"text-align:center\" width=\"200px\">"
        . "\n\t\t\t\t<?php "
        . "\n\t\t\t\techo anchor(site_url('".$c_url."/read/'.$".$c_url."->".$pk."),'<i class=\"fa fa-eye\"></i>','class=\"btn btn-flat btn-info\"'); "
        . "\n\t\t\t\techo '  '; "
        . "\n\t\t\t\techo anchor(site_url('".$c_url."/update/'.$".$c_url."->".$pk."),'<i class=\"fa fa-edit\"></i>','class=\"btn btn-flat btn-warning\"'); "
        . "\n\t\t\t\techo '  '; "
        . "\n\t\t\t\techo anchor(site_url('".$c_url."/delete/'.$".$c_url."->".$pk."),'<i class=\"fa fa-trash\"></i>','class=\"btn btn-flat btn-danger\"','onclick=\"javasciprt: return confirm(\\'Anda Yakin ?\\')\"'); "
        . "\n\t\t\t\t?>"
        . "\n\t\t\t</td>";

$string .=  "\n\t\t</tr>
                <?php
            }
            ?>
        </table>
        <div class=\"row\">
            <div class=\"col-md-6\">
                <a href=\"#\" class=\"btn btn-flat btn-primary\">Total Record : <?php echo \$total_rows ?></a>";
if ($export_excel == '1') {
    $string .= "\n\t\t<?php echo anchor(site_url('".$c_url."/excel'), '<i class=\"fa fa-file-excel-o\"></i> Excel', 'class=\"btn btn-flat btn-success\"'); ?>";
}
if ($export_word == '1') {
    $string .= "\n\t\t<?php echo anchor(site_url('".$c_url."/word'), '<i class=\"fa fa-file-word-o\"></i> Word', 'class=\"btn btn-flat btn-primary\"'); ?>";
}
if ($export_pdf == '1') {
    $string .= "\n\t\t<?php echo anchor(site_url('".$c_url."/pdf'), '<i class=\"fa fa-file-pdf-o\"></i> PDF', 'class=\"btn btn-flat btn-danger\"'); ?>";
}
$string .= "\n\t    </div>
            <div class=\"col-md-6 text-right\">
                <?php echo \$pagination ?>
            </div>
        </div>
		</div>
		</div>
		</section>
   <!-- /.content -->
  
    ";


$hasil_view_list = createFile($string, $target."views/" . $c_url . "/" . $v_list_file);

?>