
   <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>        
        <small></small>
      </h1>
      <ol class="breadcrumb">
        <li><?php echo anchor('dashboard','<i class="fa fa-dashboard"></i> Beranda</a>')?></li>
      </ol>
    </section>
    <!-- Main content -->
    <section class="content">
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div> '; 
    }  ?>
		
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title">Detail Identitas Web</h3>
		<hr />
		<form class="form-horizontal">
              <div class="box-body">
                <div class="form-group">
                  <label class="col-sm-2 control-label">Nama Web</label>
                  <div class="col-sm-10">
                    <?php echo form_input($nama_web);?>
                  </div>
                </div>
				<div class="form-group">
                  <label class="col-sm-2 control-label">Meta Deskripsi</label>
                  <div class="col-sm-10">
                    <?php echo form_textarea($meta_deskripsi);?>
                  </div>
                </div>
				<div class="form-group">
                  <label class="col-sm-2 control-label">Meta Keyword</label>
                  <div class="col-sm-10">
                    <?php echo form_textarea($meta_keyword);?>
                  </div>
                </div>
				<div class="form-group">
                  <label class="col-sm-2 control-label">Copyright</label>
                  <div class="col-sm-10">
                    <?php echo form_input($copyright);?>
                  </div>
                </div>
				<div class="form-group">
                  <label class="col-sm-2 control-label">Logo</label>
                  <div class="col-sm-10">
                    <?php if(!empty($logo)){
						echo img($logo);
					} else {
						echo img('uploads/noimagex.png');
					}
						?>
                  </div>
                </div>               
                
              </div>
              <!-- /.box-body -->
              <div class="box-footer">
                <?php 
					$id = 1;
					echo anchor('identitas_web/update/'.$id.'','<i class="fa fa-edit"></i> Ubah data',array('class'=>'btn btn-flat btn-danger'));
				?>
              </div>
              <!-- /.box-footer -->
            </form>        
        </div>
	 </div>
               
    </section>
	<!-- /.content -->